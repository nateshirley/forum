use anchor_lang::{prelude::*, AccountsClose};
use anchor_spl::token;
use std::convert::TryFrom;
declare_id!("CcssQs9DoZFQUq2nUygcFxKVFZUPvdsux7pBE9dqa2YH");
mod ixns;
mod structs;
mod utils;
use utils::{address_book, anchor_token_metadata, anchor_transfer, verify};
use anchor_lang::Discriminator;
use structs::artifact;
use structs::bid::Bid;
use structs::core::{
    Forum, ForumAuthority, Leaderboard, LeaderboardPost, Membership, MembershipAttribution, Post,
    Vote,
};
use structs::post_rewards;
//use anchor_syn;
//solana address -k target/deploy/forum-keypair.json

//to make sure it works i need to put it on devnet with different kp, run it through on 5 min loops, then we should be good
//very light testing but i think we are good to go. just change timing, redeploy, test again to make sure
//i already switched back the keys

const MEMBERSHIP_SEED: &[u8] = b"member";
const MEMBERSHIP_ATTRIBUTION_SEED: &[u8] = b"memberattribution";
const ARTIFACT_AUCTION_SEED: &[u8] = b"a_auction";
const FORUM_SEED: &[u8] = b"forum";
const FORUM_AUTHORITY_SEED: &[u8] = b"authority";
const LEADERBOARD_SEED: &[u8] = b"leaderboard";
const ARTIFACT_SEED: &[u8] = b"artifact";
const SESSION_LENGTH: u64 = 604800;
const A_AUX_HOUSE_SEED: &[u8] = b"a_aux_house";
const POST_REWARDS_CLAIM_SEED: &[u8] = b"pr_claim";

#[program]
pub mod forum {
    use super::*;

    pub fn create_leaderboard(
        ctx: Context<CreateLeaderboard>,
        leaderboard_bump: u8,
    ) -> ProgramResult {
        ixns::create_leaderboard::create_leaderboard_account(&ctx, leaderboard_bump)?;
        ixns::create_leaderboard::set_leaderboard_bump(&ctx, leaderboard_bump)?;
        Ok(())
    }
    pub fn initialize_forum(
        ctx: Context<InitializeForum>,
        forum_bump: u8,
        forum_authority_bump: u8,
        artifact_auction_bump: u8,
    ) -> ProgramResult {
        let mut leaderboard = ctx.accounts.leaderboard.load_init()?;
        verify::address::leaderboard(ctx.accounts.leaderboard.key(), leaderboard.bump)?;
        ixns::initialize_forum::init_forum_state(
            &mut ctx.accounts.forum,
            &mut ctx.accounts.forum_authority,
            &mut ctx.accounts.artifact_auction,
            forum_bump,
            forum_authority_bump,
            artifact_auction_bump,
            ctx.accounts.clock.unix_timestamp,
        )?;
        leaderboard.posts = [LeaderboardPost::default(); 10];
        leaderboard.session = 0;
        Ok(())
    }
    pub fn mint_membership(
        ctx: Context<MintMembership>,
        member_bump: u8,
        member_attribution_bump: u8,
    ) -> ProgramResult {
        ctx.accounts.forum.membership = ctx.accounts.forum.membership.checked_add(1).unwrap();
        ixns::mint_membership::init_membership_state(
            ctx.accounts,
            member_bump,
            member_attribution_bump,
        )?;
        let seeds = &[
            &FORUM_AUTHORITY_SEED[..],
            &[ctx.accounts.forum_authority.bump],
        ];
        //mint one subscription token to the subscriber
        ixns::mint_membership::mint_card_token_to_new_member(&ctx, seeds)?;
        //create metadata for membership card
        //LOCALNET MARK
        //ixns::mint_membership::create_card_token_metadata(&ctx, seeds)?;
        Ok(())
    }
    //claim authority after a transfer
    pub fn claim_membership_authority(
        ctx: Context<ClaimMembershipAuthority>,
        membership_attribution_bump: u8,
    ) -> ProgramResult {
        ctx.accounts.membership.authority = ctx.accounts.authority.key();
        ctx.accounts.new_membership_attribution.membership = ctx.accounts.membership.key();
        ctx.accounts.new_membership_attribution.card_mint = ctx.accounts.card_mint.key();
        ctx.accounts.new_membership_attribution.bump = membership_attribution_bump;

        ctx.accounts
            .previous_membership_attribution
            .close(ctx.accounts.authority.to_account_info())?;
        Ok(())
    }
    pub fn place_bid_for_artifact(
        ctx: Context<PlaceBidForArtifact>,
        artifact_auction_house_bump: u8,
        amount: u64,
    ) -> ProgramResult {
        ixns::place_bid_for_artifact::verify_bid_amount(amount, &ctx.accounts.artifact_auction)?;
        anchor_transfer::transfer_from_signer(
            ctx.accounts.into_receive_artifact_bid_context(),
            amount,
        )?;
        let losing_bid = ctx.accounts.artifact_auction.leading_bid;
        ixns::place_bid_for_artifact::return_lamps_to_newest_loser(
            &ctx,
            losing_bid,
            artifact_auction_house_bump,
        )?;
        ctx.accounts.artifact_auction.leading_bid.bidder = ctx.accounts.bidder.key();
        ctx.accounts.artifact_auction.leading_bid.lamports = amount;
        ixns::place_bid_for_artifact::adjust_end_timestamp(ctx)?;
        Ok(())
    }
    pub fn new_post(ctx: Context<NewPost>, body: String, link: String) -> ProgramResult {
        let mut post = ctx.accounts.post.load_mut()?;
        let current_session = ctx.accounts.forum.session;
        if post.session < current_session {
            post.body = ixns::new_post::new_body(body);
            post.link = ixns::new_post::new_link(link);
            post.session_score = 0;
            post.session = current_session;
            post.timestamp = u64::try_from(ctx.accounts.clock.unix_timestamp).unwrap();
            Ok(())
        } else {
            Err(ErrorCode::SinglePostPerSession.into())
        }
    }
    pub fn submit_vote(ctx: Context<SubmitVote>) -> ProgramResult {
        let mut leaderboard = ctx.accounts.leaderboard.load_mut()?;
        verify::address::leaderboard(ctx.accounts.leaderboard.key(), leaderboard.bump)?;

        let current_session = ctx.accounts.forum.session;
        let voter = &mut ctx.accounts.vote;
        if voter.session < current_session {
            let mut voted_post = ctx.accounts.post.load_mut()?;
            voted_post.session_score = voted_post.session_score.checked_add(1).unwrap();
            voted_post.all_time_score = voted_post.all_time_score.checked_add(1).unwrap();
            voter.session = current_session;
            voter.voted_for_card_mint = voted_post.card_mint.key();

            if let Some(new_leading_posts) =
                ixns::submit_vote::get_new_leading_posts(leaderboard.posts.to_vec(), voted_post)
            {
                leaderboard.posts = new_leading_posts;
            }
            Ok(())
        } else {
            Err(ErrorCode::SingleVotePerSession.into())
        }
    }
    pub fn wrap_session(
        ctx: Context<WrapSession>,
        artifact_auction_house_bump: u8,
        _artifact_attribution_bump: u8,
        artifact_bump: u8,
    ) -> ProgramResult {
        //build data store for new artifact
        ixns::wrap_session::build_new_artifact(&ctx, artifact_bump, artifact_auction_house_bump)?;
        ctx.accounts.artifact_attribution.artifact = ctx.accounts.artifact.key();

        //mint the artifact token to the winner of the auction
        let auth_seeds = &[
            &FORUM_AUTHORITY_SEED[..],
            &[ctx.accounts.forum_authority.bump],
        ];
        token::mint_to(
            ctx.accounts
                .into_mint_artifact_to_winner_context()
                .with_signer(&[auth_seeds]),
            1,
        )?;
        //LOCALNET MARK
        // ixns::wrap_session::create_artifact_metadata(
        //     &ctx,
        //     auth_seeds,
        //     artifact_auction_house_bump,
        // )?;
        ixns::wrap_session::transfer_to_forum_treasury(&ctx, artifact_auction_house_bump)?;

        //advance session
        ctx.accounts.forum.session = ctx.accounts.forum.session.checked_add(1).unwrap();
        ctx.accounts.forum.last_dawn = u64::try_from(ctx.accounts.clock.unix_timestamp).unwrap(); //ctx.accounts.forum.last_dawn.checked_add(session_LENGTH;

        //clear the leaderboard
        let mut leaderboard = ctx.accounts.leaderboard.load_mut()?;
        verify::address::leaderboard(ctx.accounts.leaderboard.key(), leaderboard.bump)?;
        leaderboard.session = ctx.accounts.forum.session;
        leaderboard.posts = [LeaderboardPost::default(); 10];

        //sync auction account
        ctx.accounts.artifact_auction.session = ctx.accounts.forum.session;
        ctx.accounts.artifact_auction.end_timestamp = ctx
            .accounts
            .forum
            .last_dawn
            .checked_add(SESSION_LENGTH)
            .unwrap();
        ctx.accounts.artifact_auction.leading_bid = Bid::default();
        Ok(())
    }
    pub fn assert_wrap_session(
        ctx: Context<AssertWrapSession>,
        claim_schedule_bump: u8,
        artifact_auction_house_bump: u8,
        _artifact_bump: u8,
        _session: u32,
    ) -> ProgramResult {
        let artifact = ctx.accounts.artifact.load_init()?;
        //creating in the ix because it's a pda with seeds from loader data (session number)
        ixns::assert_wrap_session::create_claim_schedule_account(
            &ctx,
            artifact.session,
            claim_schedule_bump,
            artifact_auction_house_bump,
        )?;
        let mut claim_account_data = ctx.accounts.claim_schedule.try_borrow_mut_data()?;
        //manually set discriminator
        for (i, disciminator_byte) in post_rewards::ClaimSchedule::discriminator()
            .iter()
            .enumerate()
        {
            claim_account_data[i] = *disciminator_byte
        }
        //set session for claim schedule from artifact
        for (i, sesstion_byte) in artifact.session.to_le_bytes().iter().enumerate() {
            claim_account_data[i + 8] = *sesstion_byte;
        }
        Ok(())
    }
    pub fn claim_post_reward(ctx: Context<ClaimPostReward>, _index: u8) -> ProgramResult {
        let index = usize::try_from(_index).unwrap();
        ixns::claim_post_reward::verify_claimer_can_mint_post_reward(&ctx, index)?;
        ctx.accounts.claim_schedule.has_claimed[index] = true;
        ixns::claim_post_reward::mint_fractional_membership_to_claimer(&ctx)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ClaimPostReward<'info> {
    claimer: Signer<'info>,
    #[account(
        constraint = membership.authority == claimer.key()
    )]
    membership: Account<'info, Membership>,
    #[account(mut)] //add a check on the address, then get rid of signer req
    fractional_membership_mint: Account<'info, token::Mint>,
    #[account(
        mut,
        constraint = fm_token_account.owner == claimer.key(),
        constraint = fm_token_account.mint == fractional_membership_mint.key()
    )]
    fm_token_account: Account<'info, token::TokenAccount>,
    artifact: Loader<'info, artifact::Artifact>,
    #[account(mut)]
    claim_schedule: Account<'info, post_rewards::ClaimSchedule>,
    forum_authority: Account<'info, ForumAuthority>,
    token_program: Program<'info, token::Token>,
}

//called after wrap session to create claim schedule from the artifact
#[derive(Accounts)]
#[instruction(claim_schedule_bump: u8, artifact_auction_house_bump: u8, artifact_bump: u8, session: u32)]
pub struct AssertWrapSession<'info> {
    #[account(
        zero,
        seeds = [ARTIFACT_SEED, &session.to_le_bytes()],
        bump = artifact_bump,
    )]
    artifact: Loader<'info, artifact::Artifact>,
    #[account(
        seeds = [A_AUX_HOUSE_SEED],
        bump = artifact_auction_house_bump
    )]
    artifact_auction_house: AccountInfo<'info>,
    #[account(mut)] //address verified by create account ix
    claim_schedule: AccountInfo<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateLeaderboard<'info> {
    #[account(mut)]
    initializer: Signer<'info>,
    #[account(mut)]
    leaderboard: AccountInfo<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(forum_bump: u8, forum_authority_bump: u8, artifact_auction_bump: u8)]
pub struct InitializeForum<'info> {
    initializer: Signer<'info>,
    #[account(
        init,
        seeds = [FORUM_SEED],
        bump = forum_bump,
        payer = initializer,
    )]
    forum: Account<'info, Forum>,
    #[account(
        init,
        seeds = [FORUM_AUTHORITY_SEED],
        bump = forum_authority_bump,
        payer = initializer
    )]
    forum_authority: Account<'info, ForumAuthority>,
    #[account(zero)]
    leaderboard: Loader<'info, Leaderboard>,
    #[account(
        init,
        seeds = [ARTIFACT_AUCTION_SEED],
        bump = artifact_auction_bump,
        payer = initializer
    )]
    artifact_auction: Account<'info, artifact::ArtifactAuction>,
    clock: Sysvar<'info, Clock>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(member_bump: u8, member_attribution_bump: u8)]
pub struct MintMembership<'info> {
    authority: Signer<'info>,
    #[account(
        init,
        seeds = [MEMBERSHIP_SEED, card_mint.key().as_ref()],
        bump = member_bump,
        payer = authority,
    )]
    membership: Box<Account<'info, Membership>>,
    #[account(
        init,
        seeds = [MEMBERSHIP_ATTRIBUTION_SEED, authority.key().as_ref()],
        bump = member_attribution_bump,
        payer = authority,
    )]
    membership_attribution: Box<Account<'info, MembershipAttribution>>,
    #[account(
        mut,
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Box<Account<'info, Forum>>,
    #[account(
        seeds = [FORUM_AUTHORITY_SEED],
        bump = forum_authority.bump,
    )]
    forum_authority: Account<'info, ForumAuthority>,
    #[account(
        zero,
        address = address_book::post(card_mint.key())
    )]
    post: Loader<'info, Post>,
    #[account(
        zero,
        address = address_book::vote(card_mint.key())
    )]
    vote: Account<'info, Vote>,
    #[account(
        constraint = card_mint.decimals == 0,
        constraint = card_mint.supply == 0,
        constraint = card_mint.freeze_authority.unwrap() == forum_authority.key(),
        constraint = card_mint.mint_authority.unwrap() == forum_authority.key(),
    )]
    card_mint: Account<'info, token::Mint>,
    #[account(mut)] //verified via cpi in the metadata program
    card_metadata: AccountInfo<'info>,
    #[account(
        mut,
        constraint = card_token_account.amount == 0,
        constraint = card_token_account.owner == authority.key()
    )]
    card_token_account: Account<'info, token::TokenAccount>,
    system_program: Program<'info, System>,
    token_program: Program<'info, token::Token>,
    #[account(address = spl_token_metadata::id())]
    token_metadata_program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
    clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
#[instruction(member_attribution_bump: u8)]
pub struct ClaimMembershipAuthority<'info> {
    authority: Signer<'info>,
    #[account(mut)]
    membership: Account<'info, Membership>,
    #[account(
        constraint = card_mint.key() == membership.card_mint,
    )]
    card_mint: Account<'info, token::Mint>,
    #[account(
        constraint = card_token_account.mint == card_mint.key(),
        constraint = card_token_account.amount >= 1,
        constraint = card_token_account.owner == authority.key()
    )]
    card_token_account: Account<'info, token::TokenAccount>,
    #[account(
        init,
        seeds = [MEMBERSHIP_ATTRIBUTION_SEED, authority.key().as_ref()],
        bump = member_attribution_bump,
        payer = authority,
    )]
    new_membership_attribution: Account<'info, MembershipAttribution>,
    #[account(
        constraint = previous_membership_attribution.card_mint == card_mint.key()
    )]
    previous_membership_attribution: Account<'info, MembershipAttribution>,
    //add someth here that gets rid of old member attribution
    system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(artifact_auction_house_bump: u8, artifact_attribution_bump: u8, artifact_bump: u8)]
pub struct WrapSession<'info> {
    initializer: Signer<'info>,
    #[account(
        mut,
        seeds = [ARTIFACT_SEED, &forum.session.to_le_bytes()],
        bump = artifact_bump,
    )]
    artifact: AccountInfo<'info>,
    #[account(
        mut,
        constraint = artifact_mint.supply == 0,
        constraint = artifact_mint.freeze_authority.unwrap() == forum_authority.key(),
        constraint = artifact_mint.mint_authority.unwrap() == forum_authority.key(),
    )]
    artifact_mint: Account<'info, token::Mint>,
    #[account(mut)] //verified in cpi to the metadata program
    artifact_metadata: AccountInfo<'info>,
    #[account(
        mut,
        constraint = artifact_token_account.owner == winner.key(),
        constraint = artifact_token_account.mint == artifact_mint.key()
    )]
    artifact_token_account: Account<'info, token::TokenAccount>,
    #[account(
        constraint = winner.key() == artifact_auction.leading_bid.bidder
    )]
    winner: AccountInfo<'info>,
    #[account(
        mut,
        constraint = artifact_auction.session == forum.session,
        seeds = [ARTIFACT_AUCTION_SEED],
        bump = artifact_auction.bump,
    )]
    artifact_auction: Box<Account<'info, artifact::ArtifactAuction>>,
    #[account(
        init,
        seeds = [ARTIFACT_SEED, artifact_mint.key().as_ref()],
        bump = artifact_attribution_bump,
        payer = initializer
    )]
    artifact_attribution: Account<'info, artifact::ArtifactAttribution>,
    #[account(
        mut,
        seeds = [A_AUX_HOUSE_SEED],
        bump = artifact_auction_house_bump
    )]
    artifact_auction_house: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Account<'info, Forum>,
    #[account(
        seeds = [FORUM_AUTHORITY_SEED],
        bump = forum_authority.bump,
    )]
    forum_authority: Account<'info, ForumAuthority>,
    #[account(mut)]
    leaderboard: Loader<'info, Leaderboard>,
    #[account(
        mut,
        address = address_book::forum_treasury()
    )]
    forum_treasury: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
    //LOCALNET MARK
    // #[account(
    //     constraint = verify::clock::to_wrap_session(clock.unix_timestamp, &artifact_auction.end_timestamp)
    // )]
    clock: Sysvar<'info, Clock>,
    token_program: Program<'info, token::Token>,
    //token_metadata_program: Program<'info, anchor_token_metadata::TokenMetadata>,
    #[account(address = spl_token_metadata::id())]
    token_metadata_program: AccountInfo<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(artifact_auction_house_bump: u8)]
pub struct PlaceBidForArtifact<'info> {
    bidder: Signer<'info>,
    #[account(mut)] //verified bc it's pulled directly off the leaderboard
    newest_loser: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [ARTIFACT_AUCTION_SEED],
        bump = artifact_auction.bump,
    )]
    artifact_auction: Account<'info, artifact::ArtifactAuction>,
    #[account(
        mut,
        seeds = [A_AUX_HOUSE_SEED],
        bump = artifact_auction_house_bump
    )]
    artifact_auction_house: AccountInfo<'info>,
    #[account(
        constraint = verify::clock::to_edit_session(clock.unix_timestamp, &artifact_auction.end_timestamp)
    )]
    clock: Sysvar<'info, Clock>,
    system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct NewPost<'info> {
    authority: Signer<'info>,
    //will force u to revoke ownership on transfer
    #[account(
        constraint = membership.authority == authority.key()
    )]
    membership: Account<'info, Membership>,
    #[account(
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Account<'info, Forum>,
    #[account(
        mut,
        seeds = [ARTIFACT_AUCTION_SEED],
        bump = artifact_auction.bump,
    )]
    artifact_auction: Account<'info, artifact::ArtifactAuction>,
    #[account(
        mut,
        address = address_book::post(card_mint.key())
    )]
    post: Loader<'info, Post>,
    #[account(
        constraint = card_mint.key() == membership.card_mint,
    )]
    card_mint: Account<'info, token::Mint>,
    #[account(
        constraint = card_token_account.mint == card_mint.key(),
        constraint = card_token_account.amount >= 1,
        constraint = card_token_account.owner == authority.key()
    )]
    card_token_account: Account<'info, token::TokenAccount>,
    #[account(
        constraint = verify::clock::to_edit_session(clock.unix_timestamp, &artifact_auction.end_timestamp)
    )]
    clock: Sysvar<'info, Clock>,
}
#[derive(Accounts)]
pub struct SubmitVote<'info> {
    authority: Signer<'info>,
    #[account(
        constraint = membership.authority == authority.key()
    )]
    membership: Account<'info, Membership>,
    #[account(
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Account<'info, Forum>,
    #[account(mut)]
    leaderboard: Loader<'info, Leaderboard>,
    #[account(
        seeds = [ARTIFACT_AUCTION_SEED],
        bump = artifact_auction.bump,
    )]
    artifact_auction: Account<'info, artifact::ArtifactAuction>,
    #[account(mut)]
    //no checks, u can submit a vote for whatever post u like
    post: Loader<'info, Post>,
    #[account(
        mut,
        address = address_book::vote(membership.card_mint)
    )]
    vote: Account<'info, Vote>,
    #[account(
        constraint = card_mint.key() == membership.card_mint,
    )]
    card_mint: Account<'info, token::Mint>,
    #[account(
        constraint = card_token_account.mint == card_mint.key(),
        constraint = card_token_account.amount >= 1,
        constraint = card_token_account.owner == authority.key()
    )]
    card_token_account: Account<'info, token::TokenAccount>,
    #[account(
        constraint = verify::clock::to_edit_session(clock.unix_timestamp, &artifact_auction.end_timestamp)
    )]
    clock: Sysvar<'info, Clock>,
}

#[error]
pub enum ErrorCode {
    #[msg("post account has already submitted this session")]
    SinglePostPerSession,
    #[msg("vote account has already voted this session")]
    SingleVotePerSession,
    #[msg("leaderboard account does not match expected, pda seed: 'leaderboard'")]
    UnauthorizedLeaderboardAccount,
    #[msg("active session has not ended.")]
    SessionNotWrapped,
    #[msg("bid does not meet minimum")]
    LowBallBid,
    #[msg("u are trying to bid on an auction that has expired")]
    BidOnExpiredAuction,
    #[msg("u are trying to settle an auction that's still open for bidding")]
    SettleActiveAuction,
    #[msg("u are claiming post rewards that don't belong to you")]
    UnathorizedPostRewards,
}

// msg!("claim data, {:?}", ctx.accounts.claim_schedule.data);
// let aa = dd.deref_mut();
// let nn = dd[2];
// ctx.accounts.claim_schedule.deserialize_data()
// ctx.accounts.claim_schedule.data = claim_schedule;
// let d = post_rewards::ClaimSchedule::try_deserialize();
// let a = post_rewards::ClaimSchedule::try_from_unchecked();
// let claim_schedule = post_rewards::ClaimSchedule::try_from(ctx.accounts.claim_schedule)?;
//let claim: Account<post_rewards::ClaimSchedule> = ctx.accounts.claim_schedule;
//let g = post_rewards::ClaimSchedule::from_account_info_unchecked(ctx.accounts.claim_schedule)?;
//let g = post_rewards::ClaimSchedule::try_from_unchecked(ctx.accounts.claim_schedule)?;
/*
- can't create claimschedule with client side ix because it's a pda, so keypair would have to sign on client
- can't create in the account declaration (here), because i can't get the session
- that's why i'm creating it with the magic that appears above. might as well let the aux house pay
*/

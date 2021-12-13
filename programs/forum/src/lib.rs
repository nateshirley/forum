use anchor_lang::{prelude::*, AccountsClose};
use anchor_spl::token;
use std::convert::TryFrom;
declare_id!("CcssQs9DoZFQUq2nUygcFxKVFZUPvdsux7pBE9dqa2YH");
mod anchor_token_metadata;
mod anchor_transfer;
mod ixns;
mod structs;
mod verify;
use structs::artifact;
use structs::bid::Bid;
use structs::core::{
    Forum, ForumAuthority, Leaderboard, LeaderboardPost, Membership, MembershipAttribution, Post,
    Vote,
};
//solana address -k target/deploy/forum-keypair.json

//to make sure it works i need to put it on devnet with different kp, run it through on 5 min loops, then we should be good
//very light testing but i think we are good to go. just redeploy, test again to make sure
//i already switched back the keys

const MEMBERSHIP_SEED: &[u8] = b"member";
const MEMBERSHIP_ATTRIBUTION_SEED: &[u8] = b"memberattribution";
const ARTIFACT_AUCTION_SEED: &[u8] = b"a_auction";
const FORUM_SEED: &[u8] = b"forum";
const FORUM_AUTHORITY_SEED: &[u8] = b"authority";
const LEADERBOARD_SEED: &[u8] = b"leaderboard";
const ARTIFACT_SEED: &[u8] = b"artifact";
const SESSION_LENGTH: u64 = 240; //604800;
const A_AUX_HOUSE_SEED: &[u8] = b"a_aux_house";

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
        verify::address::post(ctx.accounts.post.key(), ctx.accounts.card_mint.key())?;
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
        ixns::mint_membership::create_card_token_metadata(&ctx, seeds)?;
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
    pub fn wrap_session(
        ctx: Context<WrapSession>,
        artifact_auction_house_bump: u8,
        _artifact_attribution_bump: u8,
        artifact_bump: u8,
    ) -> ProgramResult {
        verify::clock::to_wrap_session(
            &ctx.accounts.clock,
            ctx.accounts.artifact_auction.end_timestamp,
        )?;
        verify::address::artifact(
            ctx.accounts.artifact.key(),
            ctx.accounts.forum.session,
            artifact_bump,
        )?;

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
                .into_mint_artifact_context()
                .with_signer(&[auth_seeds]),
            1,
        )?;
        ixns::wrap_session::create_artifact_metadata(
            &ctx,
            auth_seeds,
            artifact_auction_house_bump,
        )?;
        //todo: send funds to multisig,
        //todo: treasury cut
        //todo: set winners from the week for mint rewards

        //advance session
        ctx.accounts.forum.session = ctx.accounts.forum.session + 1;
        ctx.accounts.forum.last_dawn = u64::try_from(ctx.accounts.clock.unix_timestamp).unwrap(); //ctx.accounts.forum.last_dawn + session_LENGTH;

        //clear the leaderboard
        let mut leaderboard = ctx.accounts.leaderboard.load_mut()?;
        leaderboard.session = ctx.accounts.forum.session;
        leaderboard.posts = [LeaderboardPost::default(); 10];

        //sync auction account
        ctx.accounts.artifact_auction.session = ctx.accounts.forum.session;
        ctx.accounts.artifact_auction.end_timestamp = ctx.accounts.forum.last_dawn + SESSION_LENGTH;
        ctx.accounts.artifact_auction.leading_bid = Bid::default();
        Ok(())
    }
    pub fn assert_artifact_discriminator(
        _ctx: Context<AssertArtifactDiscriminator>,
    ) -> ProgramResult {
        Ok(())
    }
    pub fn place_bid_for_artifact(
        ctx: Context<PlaceBidForArtifact>,
        artifact_auction_house_bump: u8,
        amount: u64,
    ) -> ProgramResult {
        ixns::place_bid_for_artifact::verify_bid_amount(amount, &ctx.accounts.artifact_auction)?;
        verify::clock::to_place_bid(
            &ctx.accounts.clock,
            ctx.accounts.artifact_auction.end_timestamp,
        )?;
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
        verify::clock::to_edit_leaderboard(
            &ctx.accounts.clock,
            ctx.accounts.artifact_auction.end_timestamp,
        )?;
        verify::address::post(ctx.accounts.post.key(), ctx.accounts.card_mint.key())?;
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
    pub fn submit_vote(ctx: Context<SubmitVote>, amount: u32) -> ProgramResult {
        //i actually could move this to the param declaration
        verify::clock::to_edit_leaderboard(
            &ctx.accounts.clock,
            ctx.accounts.artifact_auction.end_timestamp,
        )?;
        verify::address::vote(ctx.accounts.vote.key(), ctx.accounts.card_mint.key())?;
        let mut leaderboard = ctx.accounts.leaderboard.load_mut()?;
        verify::address::leaderboard(ctx.accounts.leaderboard.key(), leaderboard.bump)?;

        let current_session = ctx.accounts.forum.session;
        let voter = &mut ctx.accounts.vote;
        if voter.session < current_session {
            let mut voted_post = ctx.accounts.post.load_mut()?;
            voted_post.session_score += amount;
            voted_post.all_time_score += amount;
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
}

#[derive(Accounts)]
pub struct CreateLeaderboard<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(mut)]
    pub leaderboard: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
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
    #[account(zero)]
    post: Loader<'info, Post>,
    #[account(zero)]
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
#[instruction(artifact_auction_house_bump: u8, artifact_attribution_bump: u8)]
pub struct WrapSession<'info> {
    initializer: Signer<'info>,
    #[account(mut)]
    artifact: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = artifact_mint.supply == 0
    )]
    artifact_mint: Account<'info, token::Mint>,
    #[account(mut)]
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
    artifact_auction: Account<'info, artifact::ArtifactAuction>,
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
    rent: Sysvar<'info, Rent>,
    clock: Sysvar<'info, Clock>,
    token_program: Program<'info, token::Token>,
    #[account(address = spl_token_metadata::id())]
    token_metadata_program: AccountInfo<'info>,
    system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct AssertArtifactDiscriminator<'info> {
    #[account(zero)]
    artifact: Loader<'info, artifact::Artifact>,
}
#[derive(Accounts)]
#[instruction(artifact_auction_house_bump: u8)]
pub struct PlaceBidForArtifact<'info> {
    bidder: Signer<'info>,
    #[account(mut)]
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
    #[account(mut)]
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
    post: Loader<'info, Post>,
    #[account(mut)]
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
    clock: Sysvar<'info, Clock>,
}

#[error]
pub enum ErrorCode {
    #[msg("post account does not match expected (fromSeed): authority pubky, 'post', programId")]
    UnauthorizedPostAccount,
    #[msg("vote account does not match expected (fromSeed): authority pubky, 'vote', programId")]
    UnauthorizedVoteAccount,
    #[msg("post account has already submitted this session")]
    SinglePostPerSession,
    #[msg("vote account has already voted this session")]
    SingleVotePerSession,
    #[msg("leaderboard account does not match expected, pda seed: 'leaderboard'")]
    UnauthorizedLeaderboardAccount,
    #[msg("artifact account does not match expected, pda seed: 'artifact', session")]
    UnauthorizedArtifactAccount,
    #[msg("active session has not ended.")]
    SessionNotWrapped,
    #[msg("bid does not meet minimum")]
    LowBallBid,
    #[msg("u are trying to bid on an auction that has expired")]
    BidOnExpiredAuction,
    #[msg("u are trying to settle an auction that's still open for bidding")]
    SettleActiveAuction,
}

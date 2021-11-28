use anchor_lang::{
    prelude::*,
    solana_program::{program_option, system_instruction},
    AccountsClose, InstructionData,
};
use anchor_spl::token;
use borsh::BorshDeserialize;
use std::convert::TryFrom;
declare_id!("9sNbG8rQnSZHaXVA8pMwT1TiCK8gXDgtKeEmexiyAbXp");
mod anchor_transfer;
mod artifact_auction;
mod bid;
mod create_ix;
mod leaderboard;
mod string_helper;
mod verify;
use artifact_auction::ArtifactAuction;
use bid::Bid;
use leaderboard::{Leaderboard, LeaderboardPost};
use testartifact;
//solana address -k target/deploy/forum-keypair.json

const MEMBERSHIP_SEED: &[u8] = b"member";
const MEMBERSHIP_ATTRIBUTION_SEED: &[u8] = b"memberattribution";
const ARTIFACT_AUCTION_SEED: &[u8] = b"a_auction";
const FORUM_SEED: &[u8] = b"forum";
const FORUM_AUTHORITY_SEED: &[u8] = b"authority";
const LEADERBOARD_SEED: &[u8] = b"leaderboard";
const ARTIFACT_SEED: &[u8] = b"artifact";
const SESSION_LENGTH: u64 = 100;
const A_AUX_HOUSE_SEED: &[u8] = b"a_aux_house";

#[program]
pub mod forum {
    use super::*;

    pub fn create_leaderboard(
        ctx: Context<CreateLeaderboard>,
        leaderboard_bump: u8,
    ) -> ProgramResult {
        create_ix::leaderboard_account(&ctx, leaderboard_bump)?;
        let loader: Loader<Leaderboard> =
            Loader::try_from_unchecked(ctx.program_id, &ctx.accounts.leaderboard).unwrap();
        let mut leaderboard = loader.load_init()?;
        leaderboard.bump = leaderboard_bump;
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

        ctx.accounts.forum.bump = forum_bump;
        ctx.accounts.forum.session = 1;
        ctx.accounts.forum.last_dawn = u64::try_from(ctx.accounts.clock.unix_timestamp).unwrap();
        ctx.accounts.forum_authority.bump = forum_authority_bump;

        ctx.accounts.artifact_auction.session = 1;
        ctx.accounts.artifact_auction.end_timestamp = ctx.accounts.forum.last_dawn + SESSION_LENGTH;
        ctx.accounts.artifact_auction.leading_bid = Bid::default();
        ctx.accounts.artifact_auction.bump = artifact_auction_bump;

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
        let mut post = ctx.accounts.post.load_init()?;
        post.card_mint = ctx.accounts.card_mint.key();
        post.session = ctx.accounts.forum.session - 1;
        post.timestamp = u64::try_from(ctx.accounts.clock.unix_timestamp).unwrap();

        ctx.accounts.vote.authority_card_mint = ctx.accounts.card_mint.key();
        ctx.accounts.vote.session = ctx.accounts.forum.session - 1;

        ctx.accounts.membership.authority = ctx.accounts.authority.key();
        ctx.accounts.membership.card_mint = ctx.accounts.card_mint.key();
        ctx.accounts.membership.post = ctx.accounts.post.key();
        ctx.accounts.membership.vote = ctx.accounts.vote.key();
        ctx.accounts.membership.id = ctx.accounts.forum.membership + 1;
        ctx.accounts.membership.bump = member_bump;

        ctx.accounts.membership_attribution.membership = ctx.accounts.membership.key();
        ctx.accounts.membership_attribution.card_mint = ctx.accounts.card_mint.key();
        ctx.accounts.membership_attribution.bump = member_attribution_bump;

        ctx.accounts.forum.membership = ctx.accounts.forum.membership + 1;

        let seeds = &[
            &FORUM_AUTHORITY_SEED[..],
            &[ctx.accounts.forum_authority.bump],
        ];
        //mint one subscription token to the subscriber
        token::mint_to(
            ctx.accounts
                .into_mint_membership_context()
                .with_signer(&[&seeds[..]]),
            1,
        )?;
        //add something that creates metadata for the membership card
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

    pub fn build_artifact(
        ctx: Context<BuildArtifact>,
        _artifact_attribution_bump: u8,
        artifact_bump: u8,
    ) -> ProgramResult {
        //can only build once the auction has ended
        // verify::clock::to_build_artifact(
        //     &ctx.accounts.clock,
        //     ctx.accounts.artifact_auction.end_timestamp,
        // )?;
        create_ix::artifact_account(&ctx, artifact_bump)?;
        let artifact_loader: Loader<Artifact> =
            Loader::try_from_unchecked(ctx.program_id, &ctx.accounts.artifact).unwrap();
        let mut artifact = artifact_loader.load_init()?;
        let leaderboard = ctx.accounts.leaderboard.load().unwrap();
        artifact.session = ctx.accounts.forum.session;
        artifact.card_mint = ctx.accounts.artifact_card_mint.key();
        artifact.posts = leaderboard.posts;
        artifact.bump = artifact_bump;
        drop(artifact);

        ctx.accounts.artifact_attribution.artifact = ctx.accounts.artifact.key();

        let cpi_program = ctx.accounts.test_program.to_account_info();
        let cpi_accounts = testartifact::cpi::accounts::TestArtifact {
            initializer: ctx.accounts.initializer.to_account_info(),
        };
        let ctx = CpiContext::new(cpi_program, cpi_accounts);
        testartifact::cpi::test_artifact(ctx)?;

        Ok(())
    }
    pub fn pass_try(ctx: Context<PassTry>) -> ProgramResult {
        Ok(())
    }
    pub fn wrap_session_and_advance(
        ctx: Context<WrapSessionAndAdvance>,
        _artifact_auction_house_bump: u8,
    ) -> ProgramResult {
        //artifact_auction::clock::verify_to_advance(&ctx)?;
        let artifact = ctx.accounts.artifact.load_init()?;
        verify::address::artifact(
            ctx.accounts.artifact.key(),
            ctx.accounts.forum.session,
            artifact.bump,
        )?;
        //verify that artifact session equals the forum session? or does clock force it? not sure
        let seeds = &[
            &FORUM_AUTHORITY_SEED[..],
            &[ctx.accounts.forum_authority.bump],
        ];
        //mint the artifact token to the winner of the auction
        token::mint_to(
            ctx.accounts
                .into_mint_artifact_context()
                .with_signer(&[&seeds[..]]),
            1,
        )?;

        //advance session
        ctx.accounts.forum.session = ctx.accounts.forum.session + 1;
        ctx.accounts.forum.last_dawn = u64::try_from(ctx.accounts.clock.unix_timestamp).unwrap(); //ctx.accounts.forum.last_dawn + session_LENGTH;

        //sync auction account
        ctx.accounts.artifact_auction.session = ctx.accounts.forum.session;
        ctx.accounts.artifact_auction.end_timestamp = ctx.accounts.forum.last_dawn + SESSION_LENGTH;
        ctx.accounts.artifact_auction.leading_bid = Bid::default();
        Ok(())
    }
    pub fn place_bid_for_artifact(
        ctx: Context<PlaceBidForArtifact>,
        artifact_auction_house_bump: u8,
        amount: u64,
    ) -> ProgramResult {
        artifact_auction::verify_bid_amount(amount, &ctx.accounts.artifact_auction)?;
        //artifact_auction::clock::verify_to_bid(&ctx)?;
        anchor_transfer::transfer_from_signer(
            ctx.accounts.into_receive_artifact_bid_context(),
            amount,
        )?;
        let losing_bid = ctx.accounts.artifact_auction.leading_bid;
        artifact_auction::return_lamps_to_newest_loser(
            &ctx,
            losing_bid,
            artifact_auction_house_bump,
        )?;
        ctx.accounts.artifact_auction.leading_bid.bidder = ctx.accounts.bidder.key();
        ctx.accounts.artifact_auction.leading_bid.lamports = amount;
        artifact_auction::adjust_end_timestamp(ctx)?;
        Ok(())
    }

    pub fn new_post(ctx: Context<NewPost>, body: String, link: String) -> ProgramResult {
        //verify::account::post(ctx.accounts.post.key(), ctx.accounts.card_mint.key())?;
        let mut post = ctx.accounts.post.load_mut()?;
        let current_session = ctx.accounts.forum.session;
        if true {
            //post.session < current_session {
            post.body = string_helper::new_body(body);
            post.link = string_helper::new_link(link);
            post.session_score = 0;
            post.session = current_session;
            post.timestamp = u64::try_from(ctx.accounts.clock.unix_timestamp).unwrap();
            Ok(())
        } else {
            Err(ErrorCode::SinglePostPerEpoch.into())
        }
    }
    pub fn submit_vote(ctx: Context<SubmitVote>, amount: u32) -> ProgramResult {
        //verify::account::vote(ctx.accounts.vote.key(), ctx.accounts.card_mint.key())?;
        let mut leaderboard = ctx.accounts.leaderboard.load_mut()?;
        verify::address::leaderboard(ctx.accounts.leaderboard.key(), leaderboard.bump)?;

        let current_session = ctx.accounts.forum.session;
        let voter = &mut ctx.accounts.vote;
        if true {
            //voter.session < current_session {
            let mut voted_post = ctx.accounts.post.load_mut()?;
            voted_post.session_score += amount;
            voted_post.all_time_score += amount;
            voter.session = current_session;
            voter.voted_for_card_mint = voted_post.card_mint.key();

            if let Some(new_leading_posts) =
                leaderboard::updated_posts(leaderboard.posts.to_vec(), voted_post)
            {
                leaderboard.posts = new_leading_posts;
            }
            Ok(())
        } else {
            Err(ErrorCode::SingleVotePerEpoch.into())
        }
    }
}

// #[derive(Accounts)]
// pub struct TestArtifact<'info> {
//     initializer: AccountInfo<'info>,
// #[account(zero)]
// artifact: Loader<'info, Artifact>,
// #[account(
//     constraint = artifact_card_mint.decimals == 0,
//     constraint = artifact_card_mint.supply == 0,
//     constraint = artifact_card_mint.freeze_authority.unwrap() == forum_authority.key(),
//     constraint = artifact_card_mint.mint_authority.unwrap() == forum_authority.key(),
// )]
// artifact_card_mint: Account<'info, token::Mint>,
// #[account(
//     seeds = [ARTIFACT_SEED, artifact_card_mint.key().as_ref()],
//     bump = artifact_attribution_bump,
// )]
// artifact_attribution: Account<'info, ArtifactAttribution>,
// #[account(
//     constraint = artifact_auction.session == forum.session,
//     seeds = [ARTIFACT_AUCTION_SEED],
//     bump = artifact_auction.bump,
// )]
// artifact_auction: Account<'info, ArtifactAuction>,
// #[account(
//     seeds = [FORUM_SEED],
//     bump = forum.bump
// )]
// forum: Account<'info, Forum>,
// #[account(
//     seeds = [FORUM_AUTHORITY_SEED],
//     bump = forum_authority.bump,
// )]
// forum_authority: Account<'info, ForumAuthority>,
// leaderboard: Loader<'info, Leaderboard>,
// clock: Sysvar<'info, Clock>,
// forum_program: AccountInfo<'info>,
// system_program: Program<'info, System>,
// }
#[derive(Accounts)]
pub struct PassTry<'info> {
    initializer: Signer<'info>,
    #[account(zero)]
    artifact: Loader<'info, Artifact>,
}
#[derive(Accounts)]
#[instruction(artifact_attribution_bump: u8)]
pub struct BuildArtifact<'info> {
    initializer: Signer<'info>,
    #[account(mut)]
    artifact: UncheckedAccount<'info>,
    #[account(
        constraint = artifact_card_mint.decimals == 0,
        constraint = artifact_card_mint.supply == 0,
        constraint = artifact_card_mint.freeze_authority.unwrap() == forum_authority.key(),
        constraint = artifact_card_mint.mint_authority.unwrap() == forum_authority.key(),
    )]
    artifact_card_mint: Account<'info, token::Mint>,
    #[account(
        init,
        seeds = [ARTIFACT_SEED, artifact_card_mint.key().as_ref()],
        bump = artifact_attribution_bump,
        payer = initializer
    )]
    artifact_attribution: Account<'info, ArtifactAttribution>,
    #[account(
        constraint = artifact_auction.session == forum.session,
        seeds = [ARTIFACT_AUCTION_SEED],
        bump = artifact_auction.bump,
    )]
    artifact_auction: Account<'info, ArtifactAuction>,
    #[account(
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Account<'info, Forum>,
    #[account(
        seeds = [FORUM_AUTHORITY_SEED],
        bump = forum_authority.bump,
    )]
    forum_authority: Account<'info, ForumAuthority>,
    leaderboard: Loader<'info, Leaderboard>,
    clock: Sysvar<'info, Clock>,
    test_program: AccountInfo<'info>,
    system_program: Program<'info, System>,
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
    artifact_auction: Account<'info, ArtifactAuction>,
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
    membership: Account<'info, Membership>,
    #[account(
        init,
        seeds = [MEMBERSHIP_ATTRIBUTION_SEED, authority.key().as_ref()],
        bump = member_attribution_bump,
        payer = authority,
    )]
    membership_attribution: Account<'info, MembershipAttribution>,
    #[account(
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Account<'info, Forum>,
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
    #[account(
        mut,
        constraint = card_token_account.amount == 0,
        constraint = card_token_account.owner == authority.key()
    )]
    card_token_account: Account<'info, token::TokenAccount>,
    system_program: Program<'info, System>,
    token_program: Program<'info, token::Token>,
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
//leaving this as separate ix so i can make sure discriminator gets set

#[derive(Accounts)]
#[instruction(artifact_auction_house_bump: u8)]
pub struct WrapSessionAndAdvance<'info> {
    #[account(zero)]
    artifact: Loader<'info, Artifact>,
    #[account(
        mut,
        constraint = artifact_card_mint.supply == 0
    )]
    artifact_card_mint: Account<'info, token::Mint>,
    #[account(
        mut,
        constraint = artifact_token_account.owner == winner.key(),
        constraint = artifact_token_account.mint == artifact_card_mint.key()
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
    artifact_auction: Account<'info, ArtifactAuction>,
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
    clock: Sysvar<'info, Clock>,
    token_program: Program<'info, token::Token>,
}
#[derive(Accounts)]
#[instruction(artifact_auction_house_bump: u8)]
pub struct PlaceBidForArtifact<'info> {
    bidder: Signer<'info>,
    #[account(mut)]
    newest_loser: AccountInfo<'info>,
    artifact_auction: Account<'info, ArtifactAuction>,
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

#[account]
#[derive(Default)]
pub struct Forum {
    membership: u32,
    session: u32,
    last_dawn: u64,
    bump: u8,
}
#[account]
#[derive(Default)]
pub struct ForumAuthority {
    bump: u8,
}
//pda from ["member", card_mint.key()]
#[account]
#[derive(Default)]
pub struct Membership {
    authority: Pubkey,
    card_mint: Pubkey,
    post: Pubkey,
    vote: Pubkey,
    id: u32,
    bump: u8,
}
/*
if auction is ready to start, send to auction page
*/
//pda from ["memberattribution", authority.key()]
#[account]
#[derive(Default)]
pub struct MembershipAttribution {
    membership: Pubkey,
    card_mint: Pubkey,
    bump: u8,
}
//keyFromSeed: [cardMint, "post", programID]
#[account(zero_copy)]
pub struct Post {
    card_mint: Pubkey,
    body: [u8; 140],
    link: [u8; 88],
    timestamp: u64, //seconds since 1972
    session: u32,
    session_score: u32,
    all_time_score: u32,
}
impl Post {
    fn to_leaderboard(&self) -> LeaderboardPost {
        LeaderboardPost {
            card_mint: self.card_mint,
            body: self.body,
            link: self.link,
            score: self.session_score,
        }
    }
}
//keyFromSeed: [cardMint, "vote", programID]
#[account]
#[derive(Default)]
pub struct Vote {
    authority_card_mint: Pubkey,
    voted_for_card_mint: Pubkey,
    session: u32,
}

#[account(zero_copy)]
#[derive(Default)]
pub struct Artifact {
    session: u32,
    card_mint: Pubkey,
    posts: [LeaderboardPost; 10],
    bump: u8,
}

//pda from "artifact", card_mint
#[account]
#[derive(Default)]
pub struct ArtifactAttribution {
    artifact: Pubkey,
}

impl<'info> MintMembership<'info> {
    fn into_mint_membership_context(&self) -> CpiContext<'_, '_, '_, 'info, token::MintTo<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = token::MintTo {
            mint: self.card_mint.to_account_info(),
            to: self.card_token_account.to_account_info(),
            authority: self.forum_authority.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[error]
pub enum ErrorCode {
    #[msg("post account does not match expected (fromSeed): authority pubky, 'post', programId")]
    UnauthorizedPostAccount,
    #[msg("vote account does not match expected (fromSeed): authority pubky, 'vote', programId")]
    UnauthorizedVoteAccount,
    #[msg("post account has already submitted this epoch")]
    SinglePostPerEpoch,
    #[msg("vote account has already voted this epoch")]
    SingleVotePerEpoch,
    #[msg("leaderboard account does not match expected, pda seed: 'leaderboard'")]
    UnauthorizedLeaderboardAccount,
    #[msg("artifact account does not match expected, pda seed: 'artifact', epoch")]
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

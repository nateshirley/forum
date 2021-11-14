use anchor_lang::{
    prelude::*,
    solana_program::{program_option::COption},
};
use anchor_spl::token;


declare_id!("GwMnqrRGaxWHJzu1vqzdssLjJfkM6jbLxAG8WekGwUjY");

const MEMBER_SEED: &[u8] = b"member";
const MEMBER_ATTRIBUTION_SEED: &[u8] = b"memberattribution";
const FORUM_SEED: &[u8] = b"forum";
const FORUM_AUTHORITY_SEED: &[u8] = b"authority";

//can add a name to this to make infinite forums

/*
actions
- post 
- vote

all accounts derived from mintkey except member attribution
everything else is stable from that
*/

#[program]
pub mod zine {
    use super::*;
    pub fn initialize_forum(ctx: Context<InitializeForum>, forum_bump: u8, forum_authority_bump: u8) -> ProgramResult {
        ctx.accounts.forum.bump = forum_bump;
        ctx.accounts.forum.epoch = 0;
        ctx.accounts.forum.last_reset = ctx.accounts.clock.unix_timestamp;
        ctx.accounts.forum_authority.bump = forum_authority_bump;
        Ok(())
    }

    pub fn mint_membership(ctx: Context<MintMembership>, member_bump: u8, member_attribution_bump: u8) -> ProgramResult {
        verify_post_account(ctx.accounts.post.key(), ctx.accounts.card_mint.key())?;
        let mut post = ctx.accounts.post.load_init()?;
        post.card_mint = ctx.accounts.card_mint.key();
        post.body = [0; 140];
        post.link = [0; 88];
        post.score = 0;
        post.epoch = 0;

        ctx.accounts.vote.authority_card_mint = ctx.accounts.card_mint.key();

        ctx.accounts.member.authority = ctx.accounts.authority.key();
        ctx.accounts.member.card_mint = ctx.accounts.card_mint.key();
        ctx.accounts.member.post = ctx.accounts.post.key();
        ctx.accounts.member.vote = ctx.accounts.vote.key();
        ctx.accounts.member.id = ctx.accounts.forum.membership + 1;
        ctx.accounts.member.bump = member_bump;

        ctx.accounts.member_attribution.member = ctx.accounts.member.key();
        ctx.accounts.member_attribution.card_mint = ctx.accounts.card_mint.key();
        ctx.accounts.member_attribution.bump = member_attribution_bump;

        ctx.accounts.forum.membership = ctx.accounts.forum.membership + 1;

        let seeds = &[&FORUM_AUTHORITY_SEED[..], &[ctx.accounts.forum_authority.bump]];
        //mint one subscription token to the subscriber
        token::mint_to(
            ctx.accounts
                .into_mint_membership_context()
                .with_signer(&[&seeds[..]]),
            1,
        )?;
        Ok(())
    }

    //claim authority after a transfer
    pub fn claim_membership_authority(ctx: Context<ClaimMembershipAuthority>, member_attribution_bump: u8) -> ProgramResult {
        ctx.accounts.member.authority = ctx.accounts.authority.key();
        ctx.accounts.member_attribution.member = ctx.accounts.member.key();
        ctx.accounts.member_attribution.card_mint = ctx.accounts.card_mint.key();
        ctx.accounts.member_attribution.bump = member_attribution_bump;
        Ok(())
    }

    //anyone can call once it's greater than one week from previous epoch
    pub fn advance_epoch(ctx: Context<AdvanceEpoch>) -> ProgramResult {
        //604800 seconds in a week
        if ctx.accounts.clock.unix_timestamp - ctx.accounts.forum.last_reset > 1 {
            ctx.accounts.forum.epoch = ctx.accounts.forum.epoch + 1;
            ctx.accounts.forum.last_reset = ctx.accounts.clock.unix_timestamp;
        }
        Ok(())
    }

    pub fn new_post(ctx: Context<NewPost>, body: String, link: String) -> ProgramResult {
        verify_post_account(ctx.accounts.post.key(), ctx.accounts.card_mint.key())?;
        let mut post = ctx.accounts.post.load_mut()?;
        let current_epoch = ctx.accounts.forum.epoch;
        if post.epoch <= current_epoch {
            post.body = new_body(body);
            post.link = new_link(link);
            post.score = 0;
            post.epoch = current_epoch + 1;
        }
        Ok(())
    }

    pub fn submit_vote(ctx: Context<SubmitVote>) -> ProgramResult {
        verify_vote_account(ctx.accounts.vote.key(), ctx.accounts.card_mint.key())?;
        let current_epoch = ctx.accounts.forum.epoch;
        if ctx.accounts.vote.epoch <= current_epoch {
            let mut post = ctx.accounts.post.load_mut()?;
            post.score += 1;
            ctx.accounts.vote.epoch = current_epoch + 1;
            ctx.accounts.vote.voted_for_card_mint = post.card_mint.key();
        }
        Ok(())
    }

}

fn new_body(body: String) -> [u8; 140] {
    let bytes = body.as_bytes();
    let mut new_body = [0u8; 140];
    new_body[..bytes.len()].copy_from_slice(bytes);
    new_body
}

fn new_link(link: String) -> [u8; 88] {
    let bytes = link.as_bytes();
    let mut new_link = [0u8; 88];
    new_link[..bytes.len()].copy_from_slice(bytes);
    new_link
}

//only thing i could do to make it a bit faster is store the authority on it. not sure tho
fn verify_post_account(post_address: Pubkey, card_mint: Pubkey) -> ProgramResult {
    if post_address == Pubkey::create_with_seed(&card_mint, "post", &id()).unwrap() {
        Ok(())
    } else {
        Err(ErrorCode::UnauthorizedPostAccount.into())
    }
}
fn verify_vote_account(vote_address: Pubkey, card_mint: Pubkey) -> ProgramResult {
    if vote_address == Pubkey::create_with_seed(&card_mint, "vote", &id()).unwrap() {
        Ok(())
    } else {
        Err(ErrorCode::UnauthorizedVoteAccount.into())
    }
}

#[derive(Accounts)]
#[instruction(forum_bump: u8, forum_authority_bump: u8)]
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
    clock: Sysvar<'info, Clock>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(member_bump: u8, member_attribution_bump: u8)]
pub struct MintMembership<'info> {
    authority: Signer<'info>,
    #[account(
        init,
        seeds = [MEMBER_SEED, card_mint.key().as_ref()],
        bump = member_bump,
        payer = authority,
    )]
    member: Account<'info, Member>,
    #[account(
        init,
        seeds = [MEMBER_ATTRIBUTION_SEED, authority.key().as_ref()],
        bump = member_attribution_bump,
        payer = authority,
    )]
    member_attribution: Account<'info, MemberAttribution>,
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
}

#[derive(Accounts)]
pub struct AdvanceEpoch<'info> {
    #[account(
        mut,
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Account<'info, Forum>,
    clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct NewPost<'info> {
    authority: Signer<'info>,
    //will force u to revoke ownership on transfer
    #[account(
        constraint = member.authority == authority.key()
    )]
    member: Account<'info, Member>,
    #[account(
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Account<'info, Forum>,
    #[account(mut)]
    post: Loader<'info, Post>,
    #[account(
        constraint = card_mint.key() == member.card_mint,
    )]
    card_mint: Account<'info, token::Mint>,
    #[account(
        constraint = card_token_account.mint == card_mint.key(),
        constraint = card_token_account.amount >= 1,
        constraint = card_token_account.owner == authority.key()
    )]
    card_token_account: Account<'info, token::TokenAccount>,
}

#[derive(Accounts)]
pub struct SubmitVote<'info> {
    authority: Signer<'info>,
    #[account(
        constraint = member.authority == authority.key()
    )]
    member: Account<'info, Member>,
    #[account(
        seeds = [FORUM_SEED],
        bump = forum.bump
    )]
    forum: Account<'info, Forum>,
    #[account(mut)]
    post: Loader<'info, Post>,
    #[account(mut)]
    vote: Account<'info, Vote>,
    #[account(
        constraint = card_mint.key() == member.card_mint,
    )]
    card_mint: Account<'info, token::Mint>,
    #[account(
        constraint = card_token_account.mint == card_mint.key(),
        constraint = card_token_account.amount >= 1,
        constraint = card_token_account.owner == authority.key()
    )]
    card_token_account: Account<'info, token::TokenAccount>,
}

//can do a different one for reclaiming, if u already have a member attribution account. just the same func 
//could technically build it in to the posts. but probably won't. whatever
#[derive(Accounts)]
#[instruction(member_attribution_bump: u8)]
pub struct ClaimMembershipAuthority<'info> {
    authority: Signer<'info>,
    #[account(mut)]
    member: Account<'info, Member>,
    #[account(
        constraint = card_mint.key() == member.card_mint,
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
        seeds = [MEMBER_ATTRIBUTION_SEED, authority.key().as_ref()],
        bump = member_attribution_bump,
        payer = authority,
    )]
    member_attribution: Account<'info, MemberAttribution>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct Forum {
    membership: u32,
    epoch: u32,
    last_reset: i64,
    bump: u8,
}

//enforcing attribution like this to easily see the actual wallet owners for every nft v quickly. at least active ones
//pda from ["member", card_mint.key()]
#[account]
#[derive(Default)]
pub struct Member {
    authority: Pubkey,
    card_mint: Pubkey,
    post: Pubkey,
    vote: Pubkey,
    id: u32,
    bump: u8,
}

//point of this is to easily get the member account from the wallet.
//pda from ["memberattribution", authority.key()]
#[account]
#[derive(Default)]
pub struct MemberAttribution {
    member: Pubkey,
    card_mint: Pubkey,
    bump: u8
}

//keyFromSeed: [cardMint, "post", programID]
#[account(zero_copy)]
pub struct Post {
    card_mint: Pubkey,
    body: [u8; 140],
    link: [u8; 88],
    score: u32,
    epoch: u32,
}
//keyFromSeed: [cardMint, "vote", programID]
//only thing i really need to track is whether they have voted this round, but can also include who if i want to
#[account]
#[derive(Default)]
pub struct Vote {
    authority_card_mint: Pubkey,
    voted_for_card_mint: Pubkey,
    epoch: u32,
}

#[account]
#[derive(Default)]
pub struct ForumAuthority {
    bump: u8,
}


impl<'info>MintMembership<'info> {
    fn into_mint_membership_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, token::MintTo<'info>> {
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
}
/*

so i can just take the unix timestamp and store it in the epoch account

*/

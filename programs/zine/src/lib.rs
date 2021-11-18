use anchor_lang::{
    prelude::{*},
    solana_program::{system_instruction},
};
use anchor_spl::token;
declare_id!("GwMnqrRGaxWHJzu1vqzdssLjJfkM6jbLxAG8WekGwUjY");
mod verify_account;
/*

add
- running total for users -- all time score
- add time of post
- clear old member attribution on transfer, so i can rely on checking wallet for auth
*/

const MEMBER_SEED: &[u8] = b"member";
const MEMBER_ATTRIBUTION_SEED: &[u8] = b"memberattribution";
const FORUM_SEED: &[u8] = b"forum";
const FORUM_AUTHORITY_SEED: &[u8] = b"authority";
const LEADERBOARD_SEED: &[u8] = b"leaderboard";

//can add a name to this to make infinite forums

/*
actions
- post 
- vote

all accounts derived from mintkey except member attribution
everything else is stable from that

thinking about how to create the assets
gonna have to play around with storing the metadata
but i think i will do an attribution similar to the cards

artifact_mint
leaderboard
and just copy all leaderboard data straight into it

*/

#[program]
pub mod zine {
    use super::*;

    pub fn create_leaderboard(ctx: Context<CreateLeaderboard>) -> ProgramResult {
        let (_leaderboard, _bump) = Pubkey::find_program_address(&[LEADERBOARD_SEED], ctx.program_id);
        let seeds = &[&LEADERBOARD_SEED[..], &[_bump]];
        let __anchor_rent = Rent::get()?;
        //let space: usize = 1349;
        let lamports = __anchor_rent.minimum_balance(2689);

        anchor_lang::solana_program::program::invoke_signed(
            &system_instruction::create_account(
                &ctx.accounts.initializer.key(), 
                &_leaderboard, 
                lamports, 
                2689, 
                ctx.program_id
            ),
            &[
                ctx.accounts.initializer.to_account_info(),
                ctx.accounts.leaderboard.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&seeds[..]],
        )?;

        let loader: Loader<Leaderboard> = Loader::try_from_unchecked(ctx.program_id, &ctx.accounts.leaderboard).unwrap();
        let mut leaderboard = loader.load_init()?;
        leaderboard.bump = _bump;
        Ok(())
    }
    pub fn initialize_forum(ctx: Context<InitializeForum>, forum_bump: u8, forum_authority_bump: u8) -> ProgramResult {
        let mut leaderboard = ctx.accounts.leaderboard.load_init()?;
        verify_account::leaderboard(&ctx.accounts.leaderboard.key(), leaderboard.bump, ctx.program_id)?;

        ctx.accounts.forum.bump = forum_bump;
        //right now it's in hex
        ctx.accounts.forum.epoch = 0;
        ctx.accounts.forum.last_reset = ctx.accounts.clock.unix_timestamp;
        ctx.accounts.forum_authority.bump = forum_authority_bump;

        leaderboard.posts = [LeaderboardPost::default(); 10];        
        Ok(())
    }
    pub fn mint_membership(ctx: Context<MintMembership>, member_bump: u8, member_attribution_bump: u8) -> ProgramResult {
        verify_account::post(ctx.accounts.post.key(), ctx.accounts.card_mint.key())?;
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

        //add something that creates metadata for the membership card
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
        let previous_start_time = ctx.accounts.forum.last_reset;
        if ctx.accounts.clock.unix_timestamp - previous_start_time > 1 {
            ctx.accounts.forum.epoch = ctx.accounts.forum.epoch + 1;
            ctx.accounts.forum.last_reset = previous_start_time + 1;
        }
        Ok(())
    }
    pub fn new_post(ctx: Context<NewPost>, body: String, link: String) -> ProgramResult {
        verify_account::post(ctx.accounts.post.key(), ctx.accounts.card_mint.key())?;
        let mut post = ctx.accounts.post.load_mut()?;
        let current_epoch = ctx.accounts.forum.epoch;
        if post.epoch <= current_epoch {
            post.body = new_body(body);
            post.link = new_link(link);
            post.score = 0;
            post.epoch = current_epoch + 1;
            Ok(())
        } else {
            Err(ErrorCode::SinglePostPerEpoch.into())
        }
    }
    pub fn submit_vote(ctx: Context<SubmitVote>, amount: u32) -> ProgramResult {
        verify_account::vote(ctx.accounts.vote.key(), ctx.accounts.card_mint.key())?;
        let mut leaderboard = ctx.accounts.leaderboard.load_mut()?;
        verify_account::leaderboard(&ctx.accounts.leaderboard.key(), leaderboard.bump, ctx.program_id)?;

        let current_epoch = ctx.accounts.forum.epoch;
        let voter = &mut ctx.accounts.vote;
        if true {//voter.epoch <= current_epoch {
            let mut voted_post = ctx.accounts.post.load_mut()?;
            voted_post.score += amount;
            voter.epoch = current_epoch + 1;
            voter.voted_for_card_mint = voted_post.card_mint.key();
           
            if let Some(mut new_leading_posts) = update_leading_posts(leaderboard.posts.to_vec(), voted_post) {
                let mut leaders = [LeaderboardPost::default(); 10];
                for i in (0..=(new_leading_posts.len() - 1)).rev() {
                    leaders[i] = new_leading_posts.pop().unwrap();
                }
                leaderboard.posts = leaders;
                msg!("vote triggered leaderboard updated");
            } else {
                msg!("voted post not yet eligible for leaderboard");
            }
            Ok(())
        } else {
            Err(ErrorCode::SingleVotePerEpoch.into())
        }
    }
}

fn update_leading_posts(mut leading_posts: Vec<LeaderboardPost>, voted_post: std::cell::RefMut<Post>) -> Option<Vec<LeaderboardPost>> {
    let lowest_scoring_index = leading_posts.len() - 1; //4
    let mut insert_marker = lowest_scoring_index; //last index in leaderboard
    //wraparound check
    while insert_marker < 100 && voted_post.score > leading_posts[insert_marker].score {
        if voted_post.card_mint.eq(&leading_posts[insert_marker].card_mint) {
            msg!("matching keys with score {}, at index {}", {voted_post.score}, insert_marker);
            leading_posts.remove(insert_marker);
        } else {
            insert_marker -= 1;
            msg!("skipped one");
        }
    }
    //new post on leaderboard
    //insert shifts everything to the right
    if insert_marker != lowest_scoring_index {
        leading_posts.insert(insert_marker + 1, voted_post.to_leaderboard());
        if leading_posts.len() > lowest_scoring_index + 1 {
            leading_posts.pop();
        }
        return Some(leading_posts);
    }
    None
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



#[derive(Accounts)]
pub struct CreateLeaderboard<'info> {
    #[account(mut)]
    initializer: Signer<'info>,
    #[account(mut)]
    leaderboard: AccountInfo<'info>,
    system_program: Program<'info, System>,
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
    #[account(zero)]
    leaderboard: Loader<'info, Leaderboard>,
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
    leaderboard: Loader<'info, Leaderboard>,
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
    //add someth here that gets rid of old member attribution
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
impl Post {
    fn to_leaderboard(&self) -> LeaderboardPost {
        LeaderboardPost {
            card_mint: self.card_mint,
            body: self.body,
            link: self.link,
            score: self.score,
            epoch: self.epoch,
        }
    }
}
//keyFromSeed: [cardMint, "vote", programID]
#[account]
#[derive(Default)]
pub struct Vote {
    authority_card_mint: Pubkey,
    voted_for_card_mint: Pubkey,
    epoch: u32,
}

#[account(zero_copy)]
pub struct Leaderboard {
    bump: u8,
    posts: [LeaderboardPost; 10],
}
#[zero_copy]
pub struct LeaderboardPost {
    card_mint: Pubkey,
    body: [u8; 140],
    link: [u8; 88],
    score: u32,
    epoch: u32,
}
impl Default for LeaderboardPost {
    fn default() -> Self {
        LeaderboardPost {
            card_mint: Pubkey::default(),
            body: [0u8; 140],
            link: [0u8; 88],
            score: 0,
            epoch: 0
        }
    }
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
    #[msg("post account has already submitted this epoch")]
    SinglePostPerEpoch,
    #[msg("vote account has already voted this epoch")]
    SingleVotePerEpoch,
    #[msg("leaderboard account does not match expected (fromSeed): 'leaderboard', programId")]
    UnauthorizedLeaderboardAccount,
}
/*

so i can just take the unix timestamp and store it in the epoch account

*/


/*
#[derive(Clone)]
pub struct Boop {
    pub val: [u8; 33],
}
impl borsh::BorshSerialize for Boop {
    #[inline]
    fn serialize<W: Write>(&self, _writer: &mut W) -> std::result::Result<(), std::io::Error> {
        for el in self.val.iter() {
            el.serialize(_writer)?;
        }
        Ok(())
    }
}
impl borsh::BorshDeserialize for Boop {
    #[inline]
    fn deserialize(buf: &mut &[u8]) -> std::result::Result<Boop, std::io::Error> {
        let mut result = [0u8; 33];
        for i in 0..33 {
            result[i] = u8::deserialize(buf)?;
        }
        Ok(Boop { val: result })
    }
}
impl Default for Boop {
    fn default() -> Boop {
        Boop {
            val: [0u8; 33]
        }
    }
}
#[account]
#[derive(Default)]
pub struct BigBoop {
    pub boop: Boop,
}


   // #[account(
    //     init,
    //     seeds = [FORUM_SEED],
    //     bump = forum_bump,
    //     payer = initializer
    // )]
    // big_boop: Account<'info, BigBoop>,
*/
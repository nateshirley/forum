use anchor_lang::prelude::*;
use crate::{ClaimPostReward, FORUM_AUTHORITY_SEED};
use anchor_spl::token;
use crate::ErrorCode;

pub fn verify_claimer_can_mint_post_rewards(
    ctx: &Context<ClaimPostReward>,
    index: usize
) -> ProgramResult {
    let artifact = ctx.accounts.artifact.load().unwrap();
    let was_on_leaderboard =
        artifact.posts[index].card_mint == ctx.accounts.membership.card_mint;
    let has_claimed = ctx.accounts.claim_schedule.has_claimed[index];
    if was_on_leaderboard && !has_claimed {
        return Ok(())
    } else {
        msg!("was on leaderboard at index? {}", was_on_leaderboard);
        msg!("has claimed? {}", has_claimed);
        return Err(ErrorCode::UnathorizedPostRewards.into());
    }
}

pub fn mint_fractional_membership_to_claimer(
    ctx: &Context<ClaimPostReward>,
) -> ProgramResult {
    let auth_seeds = &[
        &FORUM_AUTHORITY_SEED[..],
        &[ctx.accounts.forum_authority.bump],
    ];
    token::mint_to(
        ctx.accounts.into_mint_fractional_membership_context()
        .with_signer(&[auth_seeds]),
        100
    )
}

impl<'info> ClaimPostReward<'info> {
    pub fn into_mint_fractional_membership_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, token::MintTo<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = token::MintTo {
            mint: self.fractional_membership_mint.to_account_info(),
            to: self.fm_token_account.to_account_info(),
            authority: self.forum_authority.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
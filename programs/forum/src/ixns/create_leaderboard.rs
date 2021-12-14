use crate::structs::core::Leaderboard;
use crate::{CreateLeaderboard, LEADERBOARD_SEED};
use anchor_lang::{prelude::*, solana_program::system_instruction};
pub fn create_leaderboard_account(
    ctx: &Context<CreateLeaderboard>,
    leaderboard_bump: u8,
) -> ProgramResult {
    let seeds = &[LEADERBOARD_SEED, &[leaderboard_bump]];
    let _leaderboard = Pubkey::create_program_address(seeds, ctx.program_id).unwrap();
    let __anchor_rent = Rent::get()?;
    let lamports = __anchor_rent.minimum_balance(2653);
    anchor_lang::solana_program::program::invoke_signed(
        &system_instruction::create_account(
            &ctx.accounts.initializer.key(),
            &_leaderboard,
            lamports,
            2653,
            ctx.program_id,
        ),
        &[
            ctx.accounts.initializer.to_account_info(),
            ctx.accounts.leaderboard.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[seeds],
    )
}
pub fn set_leaderboard_bump(
    ctx: &Context<CreateLeaderboard>,
    leaderboard_bump: u8,
) -> ProgramResult {
    let loader: Loader<Leaderboard> =
        Loader::try_from_unchecked(ctx.program_id, &ctx.accounts.leaderboard).unwrap();
    let mut leaderboard = loader.load_init()?;
    leaderboard.bump = leaderboard_bump;
    Ok(())
}

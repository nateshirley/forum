use crate::{CreateLeaderboard, WrapSession, ARTIFACT_SEED, A_AUX_HOUSE_SEED, LEADERBOARD_SEED};
use anchor_lang::{prelude::*, solana_program::system_instruction};

pub fn artifact_account(
    ctx: &Context<WrapSession>,
    artifact_bump: u8,
    artifact_auction_house_bump: u8,
) -> ProgramResult {
    //figure out how to get the auction house to pay
    let artifact_seeds = &[
        ARTIFACT_SEED,
        &ctx.accounts.forum.session.to_le_bytes(),
        &[artifact_bump],
    ];
    let _artifact = Pubkey::create_program_address(artifact_seeds, ctx.program_id).unwrap();
    let __anchor_rent = Rent::get()?;
    let lamports = __anchor_rent.minimum_balance(2685);

    let house_seeds = &[&A_AUX_HOUSE_SEED[..], &[artifact_auction_house_bump]];

    anchor_lang::solana_program::program::invoke_signed(
        &system_instruction::create_account(
            &ctx.accounts.artifact_auction_house.key(),
            &_artifact,
            lamports,
            2685,
            ctx.program_id,
        ),
        &[
            ctx.accounts.artifact_auction_house.to_account_info(),
            ctx.accounts.artifact.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[artifact_seeds, house_seeds],
    )
}
pub fn leaderboard_account(
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

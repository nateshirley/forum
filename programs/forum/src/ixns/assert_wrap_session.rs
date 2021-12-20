use anchor_lang::prelude::*;
use crate::{AssertWrapSession, POST_REWARDS_CLAIM_SEED, A_AUX_HOUSE_SEED};
use crate::utils;

pub fn create_claim_schedule_account(
    ctx: &Context<AssertWrapSession>,
    session: u32,
    claim_schedule_bump: u8,
    artifact_auction_house_bump: u8,
) -> ProgramResult {
    let claim_schedule_seeds = &[
        POST_REWARDS_CLAIM_SEED,
        &session.to_le_bytes(),
        &[claim_schedule_bump],
    ];
    let claim_schedule = Pubkey::create_program_address(claim_schedule_seeds, ctx.program_id).unwrap();
    let house_seeds = &[&A_AUX_HOUSE_SEED[..], &[artifact_auction_house_bump]];

    utils::create_account_from_pda(
        ctx.accounts.artifact_auction_house.key,
        &claim_schedule,
        ctx.program_id,
        23,
        &[
            ctx.accounts.artifact_auction_house.to_account_info(),
            ctx.accounts.claim_schedule.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[claim_schedule_seeds, house_seeds]
    )
}
use crate::{id, ErrorCode};
use anchor_lang::prelude::*;
const LEADERBOARD_SEED: &[u8] = b"leaderboard";

//only thing i could do to make it a bit faster is store the authority on it. not sure tho
pub fn post(post_address: Pubkey, card_mint: Pubkey) -> ProgramResult {
    if post_address == Pubkey::create_with_seed(&card_mint, "post", &id()).unwrap() {
        Ok(())
    } else {
        Err(ErrorCode::UnauthorizedPostAccount.into())
    }
}
pub fn vote(vote_address: Pubkey, card_mint: Pubkey) -> ProgramResult {
    if vote_address == Pubkey::create_with_seed(&card_mint, "vote", &id()).unwrap() {
        Ok(())
    } else {
        Err(ErrorCode::UnauthorizedVoteAccount.into())
    }
}
pub fn leaderboard(leaderboard_address: &Pubkey, bump: u8, program_id: &Pubkey) -> ProgramResult {
    let seeds = &[&LEADERBOARD_SEED[..], &[bump]];
    let _leaderboard = Pubkey::create_program_address(seeds, program_id).unwrap();
    if _leaderboard.eq(leaderboard_address) {
        Ok(())
    } else {
        Err(ErrorCode::UnauthorizedVoteAccount.into())
    }
}

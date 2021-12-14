use crate::structs::{bid::Bid, core::LeaderboardPost};
use anchor_lang::prelude::*;
//add some functionality to store previous amounts later
#[account]
#[derive(Default)]
pub struct ArtifactAuction {
    pub session: u32,
    pub end_timestamp: u64,
    pub leading_bid: Bid,
    pub bump: u8,
}
#[account(zero_copy)]
#[derive(Default)]
pub struct Artifact {
    pub session: u32,
    pub token_mint: Pubkey,
    pub posts: [LeaderboardPost; 10],
    pub bump: u8,
}
//pda from "artifact", card_mint
#[account]
#[derive(Default)]
pub struct ArtifactAttribution {
    pub artifact: Pubkey,
}

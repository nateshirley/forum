use anchor_lang::prelude::*;
use crate::{id};



pub fn post(card_mint: Pubkey) -> Pubkey {
    Pubkey::create_with_seed(&card_mint, "post", &id()).unwrap()
}
pub fn vote(card_mint: Pubkey) -> Pubkey {
    Pubkey::create_with_seed(&card_mint, "vote", &id()).unwrap()
}
pub fn forum_treasury() -> Pubkey {
    Pubkey::new(&[
        229, 220, 49, 71, 11, 110, 112, 197, 103, 131, 44, 77, 39, 81, 157, 127, 207, 235, 157,
        178, 221, 185, 185, 17, 137, 81, 36, 210, 16, 78, 99, 80,
    ])
}

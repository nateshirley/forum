use crate::structs::artifact::ArtifactAuction;
use crate::structs::bid::Bid;
use crate::{anchor_transfer, ErrorCode, PlaceBidForArtifact, A_AUX_HOUSE_SEED};
use anchor_lang::prelude::*;
use std::convert::TryFrom;

/*
1. create artifact auction
2. place bid
3. settle auction // send to winner
*/

pub const MINIMUM_OPENING_BID: u64 = 100000000; //100,000,000 / 0.1 sol
pub const MIN_INCREMENT_PERCENTAGE: u64 = 2;

pub fn verify_bid_amount(
    amount: u64,
    artifact_auction: &Account<ArtifactAuction>,
) -> ProgramResult {
    let min_bid: u64;
    if artifact_auction.leading_bid.lamports > 0 {
        let lamps_to_clear = artifact_auction.leading_bid.lamports;
        min_bid = lamps_to_clear
            .checked_add(
                lamps_to_clear
                    .checked_mul(MIN_INCREMENT_PERCENTAGE)
                    .unwrap()
                    .checked_div(100)
                    .unwrap(),
            )
            .unwrap();
        msg!("to clear: {}, min_bid: {}", lamps_to_clear, min_bid);
    } else {
        min_bid = MINIMUM_OPENING_BID
    };
    if amount >= min_bid {
        Ok(())
    } else {
        Err(ErrorCode::LowBallBid.into())
    }
}
//extend auction by 5 minutes if there are bids within the last 5 minutes
pub fn adjust_end_timestamp(ctx: Context<PlaceBidForArtifact>) -> ProgramResult {
    if ctx
        .accounts
        .artifact_auction
        .end_timestamp
        .checked_sub(u64::try_from(ctx.accounts.clock.unix_timestamp).unwrap())
        .unwrap()
        < 300
    {
        ctx.accounts.artifact_auction.end_timestamp = ctx
            .accounts
            .artifact_auction
            .end_timestamp
            .checked_add(300)
            .unwrap();
    }
    Ok(())
}
pub fn return_lamps_to_newest_loser(
    ctx: &Context<PlaceBidForArtifact>,
    losing_bid: Bid,
    artifact_auction_house_bump: u8,
) -> ProgramResult {
    if losing_bid.lamports >= MINIMUM_OPENING_BID {
        assert!(losing_bid.bidder.eq(ctx.accounts.newest_loser.key));
        let seeds = &[&A_AUX_HOUSE_SEED[..], &[artifact_auction_house_bump]];
        anchor_transfer::transfer_from_pda(
            ctx.accounts
                .into_return_lamps_to_loser_context()
                .with_signer(&[seeds]),
            losing_bid.lamports,
        )?;
    }
    Ok(())
}
impl<'info> PlaceBidForArtifact<'info> {
    pub fn into_receive_artifact_bid_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, anchor_transfer::TransferLamports<'info>> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = anchor_transfer::TransferLamports {
            from: self.bidder.to_account_info(),
            to: self.artifact_auction_house.to_account_info(),
            system_program: self.system_program.clone(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
    pub fn into_return_lamps_to_loser_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, anchor_transfer::TransferLamports<'info>> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = anchor_transfer::TransferLamports {
            from: self.artifact_auction_house.to_account_info(),
            to: self.newest_loser.to_account_info(),
            system_program: self.system_program.clone(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

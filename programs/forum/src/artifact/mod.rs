use crate::anchor_token_metadata;
use crate::create_ix;
use crate::{
    anchor_transfer, bid::Bid, ErrorCode, LeaderboardPost, PlaceBidForArtifact, WrapSession,
    A_AUX_HOUSE_SEED,
};
use anchor_lang::prelude::*;
use anchor_spl::token;
use std::convert::TryFrom;

/*
1. create artifact auction
2. place bid
3. settle auction // send to winner
*/

pub const MINIMUM_OPENING_BID: u64 = 100000000; //100,000,000 / 0.1 sol
pub const MIN_INCREMENT_PERCENTAGE: u64 = 2;

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
    pub card_mint: Pubkey,
    pub posts: [LeaderboardPost; 10],
    pub bump: u8,
}
//pda from "artifact", card_mint
#[account]
#[derive(Default)]
pub struct ArtifactAttribution {
    pub artifact: Pubkey,
}
pub mod auction {
    use super::*;
    pub fn verify_bid_amount(
        amount: u64,
        artifact_auction: &Account<ArtifactAuction>,
    ) -> ProgramResult {
        let min_bid: u64;
        if artifact_auction.leading_bid.lamports > 0 {
            let lamps_to_clear = artifact_auction.leading_bid.lamports;
            min_bid = lamps_to_clear
                + lamps_to_clear
                    .checked_mul(MIN_INCREMENT_PERCENTAGE)
                    .unwrap()
                    .checked_div(100)
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
            ctx.accounts.artifact_auction.end_timestamp =
                ctx.accounts.artifact_auction.end_timestamp + 300;
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
}

pub fn build_new(
    ctx: &Context<WrapSession>,
    artifact_bump: u8,
    auction_house_bump: u8,
) -> ProgramResult {
    create_ix::artifact_account(&ctx, artifact_bump, auction_house_bump)?;
    let artifact_loader: Loader<Artifact> =
        Loader::try_from_unchecked(ctx.program_id, &ctx.accounts.artifact).unwrap();
    let mut artifact = artifact_loader.load_init()?;
    let leaderboard = ctx.accounts.leaderboard.load().unwrap();
    artifact.session = ctx.accounts.forum.session;
    artifact.card_mint = ctx.accounts.artifact_mint.key();
    artifact.posts = leaderboard.posts;
    artifact.bump = artifact_bump;
    Ok(())
}
pub fn create_artifact_metadata(ctx: &Context<WrapSession>, seeds: &[&[u8]; 2]) -> ProgramResult {
    //possibly change creator to treasury account to get some royalties
    //probably should add master edition too
    let creators = vec![spl_token_metadata::state::Creator {
        address: ctx.accounts.forum_authority.key(),
        verified: true,
        share: 100,
    }];
    let name: String = String::from("session artifact");
    let symbol: String = String::from("ART");
    let uri: String = String::from("https://nateshirley.github.io/feed/session/artifact.json"); //make it look like a card eventually
    anchor_token_metadata::create_metadata(
        ctx.accounts
            .into_create_artifact_metadata_context()
            .with_signer(&[&seeds[..]]),
        name,
        symbol,
        uri,
        Some(creators),
        0,
        true,
        true,
    )
}

impl<'info> WrapSession<'info> {
    pub fn into_create_artifact_metadata_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, anchor_token_metadata::CreateMetadata<'info>> {
        let cpi_program = self.token_metadata_program.to_account_info();
        let cpi_accounts = anchor_token_metadata::CreateMetadata {
            metadata: self.artifact_metadata.to_account_info(),
            mint: self.artifact_mint.to_account_info(),
            mint_authority: self.forum_authority.to_account_info(),
            payer: self.initializer.clone(),
            update_authority: self.forum_authority.to_account_info(),
            token_metadata_program: self.token_metadata_program.to_account_info(),
            system_program: self.system_program.clone(),
            rent: self.rent.clone(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'info> WrapSession<'info> {
    pub fn into_mint_artifact_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, token::MintTo<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = token::MintTo {
            mint: self.artifact_mint.to_account_info(),
            to: self.artifact_token_account.to_account_info(),
            authority: self.forum_authority.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

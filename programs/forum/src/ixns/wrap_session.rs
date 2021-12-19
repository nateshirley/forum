use crate::anchor_token_metadata;
use crate::anchor_transfer;
use crate::structs::artifact::Artifact;
use crate::{WrapSession, AssertWrapSession, POST_REWARDS_CLAIM_SEED, ARTIFACT_SEED, A_AUX_HOUSE_SEED};
use anchor_lang::{prelude::*, solana_program::system_instruction};
use anchor_spl::token;
use std::convert::TryFrom;

pub fn create_artifact_account(
    ctx: &Context<WrapSession>,
    artifact_bump: u8,
    artifact_auction_house_bump: u8,
) -> ProgramResult {
    //auction house pays
    let artifact_seeds = &[
        ARTIFACT_SEED,
        &ctx.accounts.forum.session.to_le_bytes(),
        &[artifact_bump],
    ];
    let artifact = Pubkey::create_program_address(artifact_seeds, ctx.program_id).unwrap();
    let house_seeds = &[&A_AUX_HOUSE_SEED[..], &[artifact_auction_house_bump]];

    create_account_from_pda(
        ctx.accounts.artifact_auction_house.key,
        &artifact,
        ctx.program_id,
        2685,
        &[
            ctx.accounts.artifact_auction_house.to_account_info(),
            ctx.accounts.artifact.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[artifact_seeds, house_seeds]
    )
}

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

    create_account_from_pda(
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

pub fn create_account_from_pda(
    from_pda_pubkey: &Pubkey,
    to_pubkey: &Pubkey,
    program_id: &Pubkey,
    space: u64,
    account_infos: &[AccountInfo],
    signers_seeds: &[&[&[u8]]]
) -> ProgramResult {
    let __anchor_rent = Rent::get()?;
    let lamports = __anchor_rent.minimum_balance(usize::try_from(space).unwrap());
    anchor_lang::solana_program::program::invoke_signed(
        &system_instruction::create_account(
            from_pda_pubkey,
            to_pubkey,
            lamports,
            space,
            program_id,
        ),
        account_infos,
        signers_seeds,
    )
}

//need to write a func that executes general create program ixns

//i should just make a generalized create_ix inside here
//takes in seeds and creates the acct

pub fn build_new_artifact(
    ctx: &Context<WrapSession>,
    artifact_bump: u8,
    auction_house_bump: u8,
) -> ProgramResult {
    create_artifact_account(&ctx, artifact_bump, auction_house_bump)?;
    let artifact_loader: Loader<Artifact> =
        Loader::try_from_unchecked(ctx.program_id, &ctx.accounts.artifact).unwrap();
    let mut artifact = artifact_loader.load_init()?;
    let leaderboard = ctx.accounts.leaderboard.load().unwrap();
    artifact.session = ctx.accounts.forum.session;
    artifact.token_mint = ctx.accounts.artifact_mint.key();
    artifact.posts = leaderboard.posts;
    artifact.bump = artifact_bump;
    Ok(())
}

pub fn create_artifact_metadata(
    ctx: &Context<WrapSession>,
    auth_seeds: &[&[u8]; 2],
    auction_house_bump: u8,
) -> ProgramResult {
    //possibly change creator to treasury account to get some royalties
    //probably should add master edition too
    let creators = vec![spl_token_metadata::state::Creator {
        address: ctx.accounts.forum_authority.key(),
        verified: true,
        share: 100,
    }];
    let session_string = ctx.accounts.forum.session.to_string();
    let mut name: String = String::from("PRH");
    name.push_str(&session_string);
    let mut symbol: String = String::from("PRH");
    symbol.push_str(&session_string);
    let uri: String =
        String::from("https://nateshirley.github.io/y/parisradiohour/session/artifact.json");
    let house_seeds = &[&A_AUX_HOUSE_SEED[..], &[auction_house_bump]];

    anchor_token_metadata::create_metadata(
        ctx.accounts
            .into_create_artifact_metadata_context()
            .with_signer(&[auth_seeds, house_seeds]),
        name,
        symbol,
        uri,
        Some(creators),
        0,
        true,
        true,
    )
}
pub fn transfer_to_forum_treasury(
    ctx: &Context<WrapSession>,
    auction_house_bump: u8,
) -> ProgramResult {
    let seeds = &[&A_AUX_HOUSE_SEED[..], &[auction_house_bump]];
    let treasury_take = calculate_treasury_take(
        &ctx.accounts.artifact_auction_house,
        &ctx.accounts.artifact_auction.leading_bid.lamports,
    );

    anchor_transfer::transfer_from_pda(
        ctx.accounts
            .into_transfer_to_forum_treasury_context()
            .with_signer(&[seeds]),
        treasury_take,
    )?;
    Ok(())
}

pub fn calculate_treasury_take(auction_house: &AccountInfo, sale_price: &u64) -> u64 {
    let mut treasury_take = *sale_price;
    let next_aux_house_balance = auction_house.lamports().checked_sub(treasury_take).unwrap();
    let half_sol: u64 = 500000000;
    if *sale_price > half_sol && next_aux_house_balance < half_sol {
        //make sure the auction house always has at least 0.5 sol to pay for new acct creation
        treasury_take = treasury_take
            .checked_sub(half_sol.checked_sub(next_aux_house_balance).unwrap())
            .unwrap();
    }
    treasury_take
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
            payer: self.artifact_auction_house.to_account_info(),
            update_authority: self.forum_authority.to_account_info(),
            token_metadata_program: self.token_metadata_program.to_account_info(),
            system_program: self.system_program.clone(),
            rent: self.rent.clone(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
    pub fn into_mint_artifact_to_winner_context(
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
    pub fn into_transfer_to_forum_treasury_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, anchor_transfer::TransferLamports<'info>> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = anchor_transfer::TransferLamports {
            from: self.artifact_auction_house.to_account_info(),
            to: self.forum_treasury.to_account_info(),
            system_program: self.system_program.clone(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

use crate::anchor_token_metadata;
use crate::MintMembership;
use anchor_lang::prelude::*;
use anchor_spl::token;
use std::convert::TryFrom;
pub fn init_membership_state(
    accounts: &mut MintMembership,
    member_bump: u8,
    member_attribution_bump: u8,
) -> ProgramResult {
    let mut post = accounts.post.load_init()?;
    post.card_mint = accounts.card_mint.key();
    post.session = accounts.forum.session.checked_sub(1).unwrap();
    post.timestamp = u64::try_from(accounts.clock.unix_timestamp).unwrap();

    accounts.vote.authority_card_mint = accounts.card_mint.key();
    accounts.vote.session = accounts.forum.session.checked_sub(1).unwrap();

    accounts.membership.authority = accounts.authority.key();
    accounts.membership.card_mint = accounts.card_mint.key();
    accounts.membership.post = accounts.post.key();
    accounts.membership.vote = accounts.vote.key();
    accounts.membership.id = accounts.forum.membership;
    accounts.membership.bump = member_bump;

    accounts.membership_attribution.membership = accounts.membership.key();
    accounts.membership_attribution.card_mint = accounts.card_mint.key();
    accounts.membership_attribution.bump = member_attribution_bump;

    Ok(())
}
pub fn mint_card_token_to_new_member(
    ctx: &Context<MintMembership>,
    seeds: &[&[u8]; 2],
) -> ProgramResult {
    token::mint_to(
        ctx.accounts
            .into_mint_membership_context()
            .with_signer(&[seeds]),
        1,
    )
}
pub fn create_card_token_metadata(
    ctx: &Context<MintMembership>,
    seeds: &[&[u8]; 2],
) -> ProgramResult {
    //possibly change creator to treasury account to get some royalties
    //probably should add master edition too
    let creators = vec![spl_token_metadata::state::Creator {
        address: ctx.accounts.forum_authority.key(),
        verified: true,
        share: 100,
    }];
    let session = ctx.accounts.forum.membership.to_string();
    let mut name: String = String::from("PRH Member ");
    name.push_str(&session);
    let mut symbol: String = String::from("MEM");
    symbol.push_str(&session);
    let uri: String =
        String::from("https://nateshirley.github.io/y/parisradiohour/membership/card.json"); //make it look like a card eventually
    anchor_token_metadata::create_metadata(
        ctx.accounts
            .into_create_membership_card_metadata_context()
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

impl<'info> MintMembership<'info> {
    pub fn into_create_membership_card_metadata_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, anchor_token_metadata::CreateMetadata<'info>> {
        let cpi_program = self.token_metadata_program.to_account_info();
        let cpi_accounts = anchor_token_metadata::CreateMetadata {
            metadata: self.card_metadata.to_account_info(),
            mint: self.card_mint.to_account_info(),
            mint_authority: self.forum_authority.to_account_info(),
            payer: self.authority.to_account_info(),
            update_authority: self.forum_authority.to_account_info(),
            token_metadata_program: self.token_metadata_program.to_account_info(),
            system_program: self.system_program.clone(),
            rent: self.rent.clone(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
impl<'info> MintMembership<'info> {
    pub fn into_mint_membership_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, token::MintTo<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = token::MintTo {
            mint: self.card_mint.to_account_info(),
            to: self.card_token_account.to_account_info(),
            authority: self.forum_authority.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

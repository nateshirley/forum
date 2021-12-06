use crate::anchor_token_metadata;
use crate::MintMembership;
use anchor_lang::prelude::*;
use anchor_spl::token;

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
    let name: String = String::from("yelllow feed");
    let symbol: String = String::from("YF");
    let uri: String = String::from("https://nateshirley.github.io/feed/membership/default.json"); //make it look like a card eventually
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
            payer: self.authority.clone(),
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

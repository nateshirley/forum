use anchor_lang::{solana_program, prelude::*};
use std::convert::TryFrom;
pub fn create_account(
    from_pda_pubkey: &Pubkey,
    to_pubkey: &Pubkey,
    program_id: &Pubkey,
    space: u64,
    account_infos: &[AccountInfo],
    signers_seeds: &[&[&[u8]]]
) -> ProgramResult {
    let __anchor_rent = Rent::get()?;
    let lamports = __anchor_rent.minimum_balance(usize::try_from(space).unwrap());
    solana_program::program::invoke_signed(
        &solana_program::system_instruction::create_account(
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
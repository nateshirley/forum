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

/*
let me play this out a little bit

wrap_zine
- called 6 days after last refresh
- it takes the leaderboard and copies it into an artifact
- initializes an auction for the artifact
- sets the forum state to Auction
- cleans up membership issuance (if going that route)

(could also separate member issuance into separate tx)
- ehh idk

advance_epoch
- called 7 days after last refresh
- finalizes auction
    - mints new asset to winner
- moves the epoch count +1
- sets forum state back to active
- issues new member tokens


current thoughts on membership issuance
- most important thing is i want memberships to be forced converted. i don't want to sell tokens that will go unconverted
- i can't add liquidity directly to the orderbook without choosing on a price. open for market manipulation
- not sure when market will be liquid enough
- i think it makes more sense to go directly into the auction for membership. shouldn't be too bad
- 5 min extension forces everyone to reveal their prices earlier, otherwise they are just wasting everyone's time


how to issue the member tokens?
- i think you will have to create a whitelist with the winners and let them claim
- otherwise it's a bit thorny. i don't want to ask one person to do 9 mints, mint is a heavy tx
someth maybe like: array of wallet keys ->
address: ["newmembers," epoch]
- array of 9 wallet pks
- array of 9 bools -- hasMinted
- claim membership
- is wallet winner? pull account, run through all addresses
- when u call, checks that your wallet is in the array
- sets index at hasMinted to true
- so u just run through the auctionleaderboard and add them to whitelist for that epoch
- bc u need all the accounts, 40+

or i could just sign it with the treasury, which would be a much better ux.
i should probably do that
just set it up where a
how to fund treasury?

u need every bid to be returnable anyway so all the bids will have to go to
an auction house pda

use the auction house to pay for the mints, then send the rest to a treasury wallet
boom bitch

finalize member auction:
iterate through leaderboard, for each wallet, mint a membership, using pda to pay for it,
transfer funds to multisig

how to issue the zine:
not worrying about metadata rn
just have a token with placeholder metadata, same for all, will deal with all svg stuff later
create pda like i already have with ["zine", epochnumber], which stores a card mint, plus all the post data

when the auction is finalized, run a trad nft mint (new mint),
set the mint in the zine account to the nft mint
create an attribution account with seed ["zine", zineMint], that stores the epoch number and the zine account

being able to find the zine with either [epochnumber] or [zinemint]
u probably need both
*/

use crate::{id, ErrorCode, LEADERBOARD_SEED};
use anchor_lang::prelude::*;
use std::convert::TryFrom;

pub mod address {
    use super::*;
    pub fn leaderboard(leaderboard_address: Pubkey, bump: u8) -> ProgramResult {
        let seeds = &[&LEADERBOARD_SEED[..], &[bump]];
        let _leaderboard = Pubkey::create_program_address(seeds, &id())?;
        if _leaderboard.eq(&leaderboard_address) {
            Ok(())
        } else {
            Err(ErrorCode::UnauthorizedLeaderboardAccount.into())
        }
    }
}

pub mod clock {
    use super::*;
    pub fn to_edit_session(
        unix_timestamp: i64,
        auction_end_timestamp: &u64,
    ) -> bool {
        let now = as_u64(unix_timestamp);
        now < *auction_end_timestamp
    }
    pub fn to_wrap_session(
        unix_timestamp: i64,
        auction_end_timestamp: &u64,
    ) -> bool {
        let now = as_u64(unix_timestamp);
        now > *auction_end_timestamp
    }
    pub fn as_u64(unix_timestamp: i64) -> u64 {
        u64::try_from(unix_timestamp).unwrap()
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

im p sure something will get fucked up if i push 36 accounts into this program bc the stack size can't handle it.
i also think it will be a waste of time atm
so i'm going to implement a redemption mech for winners to redeem

only other option is to have 9 auctions in the background and let them talk to each other
then the ui will just show a tx option for each of the

how would that work?
each account would have its own auction index, but share the same leaderboard,
each account responsible for settling the tx for that new member,
how would u know which account to submit new bids to?

u would have to guarantee that the new bid is in the correct account.
is there any benefit to this??
it's basically just a more complicated version of the other design i think
fuck it

the only option is redemption or passing in 40 accounts. redemption



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




okay so i just need a basic auction, 9 slots, will start with 4. very similar to the leaderboard


i think i can just use the same logic??
---------------------








potential phases

1. open forum
2. artifact built
    - no more posts
    - no more votes
3. started auction
    - no posts/votes
    - only bid for thing
4. auction ended (no more bids, need to advance to next epoch)
    -






*/

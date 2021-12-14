use crate::structs::artifact::ArtifactAuction;
use crate::structs::bid::Bid;
use crate::structs::core::{Forum, ForumAuthority};
use crate::SESSION_LENGTH;
use anchor_lang::prelude::*;
use std::convert::TryFrom;
pub fn init_forum_state(
    forum: &mut Account<Forum>,
    forum_authority: &mut Account<ForumAuthority>,
    artifact_auction: &mut Account<ArtifactAuction>,
    forum_bump: u8,
    forum_authority_bump: u8,
    artifact_auction_bump: u8,
    unix_timestamp: i64,
) -> ProgramResult {
    forum.bump = forum_bump;
    forum.session = 1;
    forum.last_dawn = u64::try_from(unix_timestamp).unwrap();

    forum_authority.bump = forum_authority_bump;

    artifact_auction.session = 1;
    artifact_auction.end_timestamp = forum.last_dawn + SESSION_LENGTH;
    artifact_auction.leading_bid = Bid::default();
    artifact_auction.bump = artifact_auction_bump;

    Ok(())
}

use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Forum {
    pub membership: u32,
    pub session: u32,
    pub last_dawn: u64,
    pub bump: u8,
}
#[account]
#[derive(Default)]
pub struct ForumAuthority {
    pub bump: u8,
}
//pda from ["member", card_mint.key()]
#[account]
#[derive(Default)]
pub struct Membership {
    pub authority: Pubkey,
    pub card_mint: Pubkey,
    pub post: Pubkey,
    pub vote: Pubkey,
    pub id: u32,
    pub bump: u8,
}
//pda from ["memberattribution", authority.key()]
#[account]
#[derive(Default)]
pub struct MembershipAttribution {
    pub membership: Pubkey,
    pub card_mint: Pubkey,
    pub bump: u8,
}
//keyFromSeed: [cardMint, "post", programID]
#[account(zero_copy)]
pub struct Post {
    pub card_mint: Pubkey,
    pub body: [u8; 140],
    pub link: [u8; 88],
    pub timestamp: u64, //seconds since 1972
    pub session: u32,
    pub session_score: u32,
    pub all_time_score: u32,
}
impl Post {
    pub fn to_leaderboard(&self) -> LeaderboardPost {
        LeaderboardPost {
            card_mint: self.card_mint,
            body: self.body,
            link: self.link,
            score: self.session_score,
        }
    }
}
//keyFromSeed: [cardMint, "vote", programID]
#[account]
#[derive(Default)]
pub struct Vote {
    pub authority_card_mint: Pubkey,
    pub voted_for_card_mint: Pubkey,
    pub session: u32,
}
#[account(zero_copy)]
pub struct Leaderboard {
    pub session: u32,
    pub posts: [LeaderboardPost; 10],
    pub bump: u8,
}
#[zero_copy]
pub struct LeaderboardPost {
    pub card_mint: Pubkey,
    pub body: [u8; 140],
    pub link: [u8; 88],
    pub score: u32,
}
impl Default for LeaderboardPost {
    fn default() -> Self {
        LeaderboardPost {
            card_mint: Pubkey::default(),
            body: [0u8; 140],
            link: [0u8; 88],
            score: 0,
        }
    }
}

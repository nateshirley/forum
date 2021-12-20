use anchor_lang::prelude::*;
#[account]
pub struct ClaimSchedule {
    pub session: u32,
    pub has_claimed: [bool; 10],
    pub bump: u8,
}
impl Default for ClaimSchedule {
    fn default() -> ClaimSchedule {
        ClaimSchedule {
            session: 0,
            has_claimed: [false; 10],
            bump: 0,
        }
    }
}
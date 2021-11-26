export type Forum = {
  "version": "0.0.0",
  "name": "forum",
  "instructions": [
    {
      "name": "createLeaderboard",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "leaderboardBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeForum",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "forumBump",
          "type": "u8"
        },
        {
          "name": "forumAuthorityBump",
          "type": "u8"
        },
        {
          "name": "artifactAuctionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "mintMembership",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "membershipAttribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cardTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "memberBump",
          "type": "u8"
        },
        {
          "name": "memberAttributionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claimMembershipAuthority",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cardTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newMembershipAttribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "previousMembershipAttribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "membershipAttributionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "buildArtifact",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "artifact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactCardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactAttribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "artifactAttributionBump",
          "type": "u8"
        },
        {
          "name": "artifactBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "startArtifactAuction",
      "accounts": [
        {
          "name": "artifact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "placeBidForArtifact",
      "accounts": [
        {
          "name": "bidder",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newestLoser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactAuctionHouse",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "artifactAuctionHouseBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleArtifactAuctionAndAdvanceEpoch",
      "accounts": [
        {
          "name": "artifact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactCardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactAuction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactAuctionHouse",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "auctionHouseBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "newPost",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cardTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "body",
          "type": "string"
        },
        {
          "name": "link",
          "type": "string"
        }
      ]
    },
    {
      "name": "submitVote",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cardTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "artifactAuction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "endTimestamp",
            "type": "u64"
          },
          {
            "name": "leadingBid",
            "type": {
              "defined": "Bid"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "forum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "membership",
            "type": "u32"
          },
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "lastDawn",
            "type": "u64"
          },
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "forumAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "membership",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "post",
            "type": "publicKey"
          },
          {
            "name": "vote",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "membershipAttribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "membership",
            "type": "publicKey"
          },
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "body",
            "type": {
              "array": [
                "u8",
                140
              ]
            }
          },
          {
            "name": "link",
            "type": {
              "array": [
                "u8",
                88
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "epochScore",
            "type": "u32"
          },
          {
            "name": "allTimeScore",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authorityCardMint",
            "type": "publicKey"
          },
          {
            "name": "votedForCardMint",
            "type": "publicKey"
          },
          {
            "name": "epoch",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "artifact",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "posts",
            "type": {
              "array": [
                {
                  "defined": "LeaderboardPost"
                },
                10
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "artifactAttribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "artifact",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "leaderboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "posts",
            "type": {
              "array": [
                {
                  "defined": "LeaderboardPost"
                },
                10
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Bid",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bidder",
            "type": "publicKey"
          },
          {
            "name": "lamports",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "LeaderboardPost",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "body",
            "type": {
              "array": [
                "u8",
                140
              ]
            }
          },
          {
            "name": "link",
            "type": {
              "array": [
                "u8",
                88
              ]
            }
          },
          {
            "name": "score",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 300,
      "name": "UnauthorizedPostAccount",
      "msg": "post account does not match expected (fromSeed): authority pubky, 'post', programId"
    },
    {
      "code": 301,
      "name": "UnauthorizedVoteAccount",
      "msg": "vote account does not match expected (fromSeed): authority pubky, 'vote', programId"
    },
    {
      "code": 302,
      "name": "SinglePostPerEpoch",
      "msg": "post account has already submitted this epoch"
    },
    {
      "code": 303,
      "name": "SingleVotePerEpoch",
      "msg": "vote account has already voted this epoch"
    },
    {
      "code": 304,
      "name": "UnauthorizedLeaderboardAccount",
      "msg": "leaderboard account does not match expected, pda seed: 'leaderboard'"
    },
    {
      "code": 305,
      "name": "UnauthorizedArtifactAccount",
      "msg": "artifact account does not match expected, pda seed: 'artifact', epoch"
    },
    {
      "code": 306,
      "name": "SessionWindowClosed",
      "msg": "session window closed. no posts or votes can be submitted until the epoch reaches a new dawn"
    },
    {
      "code": 307,
      "name": "EpochHasNotReachedArtifactWindow",
      "msg": "artifact window not open. session is still playing out"
    },
    {
      "code": 308,
      "name": "EpochIneligbileForNewDawn",
      "msg": "epoch has not reached new dawn"
    },
    {
      "code": 309,
      "name": "LowBallBid",
      "msg": "bid does not meet minimum"
    },
    {
      "code": 310,
      "name": "BidOnExpiredAuction",
      "msg": "u are trying to bid on an auction that has expired"
    },
    {
      "code": 311,
      "name": "SettleActiveAuction",
      "msg": "u are trying to settle an auction that's still open for bidding"
    }
  ]
};

export const IDL: Forum = {
  "version": "0.0.0",
  "name": "forum",
  "instructions": [
    {
      "name": "createLeaderboard",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "leaderboardBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeForum",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "forumBump",
          "type": "u8"
        },
        {
          "name": "forumAuthorityBump",
          "type": "u8"
        },
        {
          "name": "artifactAuctionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "mintMembership",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "membershipAttribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cardTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "memberBump",
          "type": "u8"
        },
        {
          "name": "memberAttributionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claimMembershipAuthority",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cardTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newMembershipAttribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "previousMembershipAttribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "membershipAttributionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "buildArtifact",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "artifact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactCardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactAttribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "artifactAttributionBump",
          "type": "u8"
        },
        {
          "name": "artifactBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "startArtifactAuction",
      "accounts": [
        {
          "name": "artifact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "placeBidForArtifact",
      "accounts": [
        {
          "name": "bidder",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newestLoser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactAuctionHouse",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "artifactAuctionHouseBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleArtifactAuctionAndAdvanceEpoch",
      "accounts": [
        {
          "name": "artifact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactCardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactAuction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "artifactAuctionHouse",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "auctionHouseBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "newPost",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cardTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "body",
          "type": "string"
        },
        {
          "name": "link",
          "type": "string"
        }
      ]
    },
    {
      "name": "submitVote",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "post",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cardTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "artifactAuction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "endTimestamp",
            "type": "u64"
          },
          {
            "name": "leadingBid",
            "type": {
              "defined": "Bid"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "forum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "membership",
            "type": "u32"
          },
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "lastDawn",
            "type": "u64"
          },
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "forumAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "membership",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "post",
            "type": "publicKey"
          },
          {
            "name": "vote",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "membershipAttribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "membership",
            "type": "publicKey"
          },
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "body",
            "type": {
              "array": [
                "u8",
                140
              ]
            }
          },
          {
            "name": "link",
            "type": {
              "array": [
                "u8",
                88
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "epochScore",
            "type": "u32"
          },
          {
            "name": "allTimeScore",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authorityCardMint",
            "type": "publicKey"
          },
          {
            "name": "votedForCardMint",
            "type": "publicKey"
          },
          {
            "name": "epoch",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "artifact",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "posts",
            "type": {
              "array": [
                {
                  "defined": "LeaderboardPost"
                },
                10
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "artifactAttribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "artifact",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "leaderboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "posts",
            "type": {
              "array": [
                {
                  "defined": "LeaderboardPost"
                },
                10
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Bid",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bidder",
            "type": "publicKey"
          },
          {
            "name": "lamports",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "LeaderboardPost",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cardMint",
            "type": "publicKey"
          },
          {
            "name": "body",
            "type": {
              "array": [
                "u8",
                140
              ]
            }
          },
          {
            "name": "link",
            "type": {
              "array": [
                "u8",
                88
              ]
            }
          },
          {
            "name": "score",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 300,
      "name": "UnauthorizedPostAccount",
      "msg": "post account does not match expected (fromSeed): authority pubky, 'post', programId"
    },
    {
      "code": 301,
      "name": "UnauthorizedVoteAccount",
      "msg": "vote account does not match expected (fromSeed): authority pubky, 'vote', programId"
    },
    {
      "code": 302,
      "name": "SinglePostPerEpoch",
      "msg": "post account has already submitted this epoch"
    },
    {
      "code": 303,
      "name": "SingleVotePerEpoch",
      "msg": "vote account has already voted this epoch"
    },
    {
      "code": 304,
      "name": "UnauthorizedLeaderboardAccount",
      "msg": "leaderboard account does not match expected, pda seed: 'leaderboard'"
    },
    {
      "code": 305,
      "name": "UnauthorizedArtifactAccount",
      "msg": "artifact account does not match expected, pda seed: 'artifact', epoch"
    },
    {
      "code": 306,
      "name": "SessionWindowClosed",
      "msg": "session window closed. no posts or votes can be submitted until the epoch reaches a new dawn"
    },
    {
      "code": 307,
      "name": "EpochHasNotReachedArtifactWindow",
      "msg": "artifact window not open. session is still playing out"
    },
    {
      "code": 308,
      "name": "EpochIneligbileForNewDawn",
      "msg": "epoch has not reached new dawn"
    },
    {
      "code": 309,
      "name": "LowBallBid",
      "msg": "bid does not meet minimum"
    },
    {
      "code": 310,
      "name": "BidOnExpiredAuction",
      "msg": "u are trying to bid on an auction that has expired"
    },
    {
      "code": 311,
      "name": "SettleActiveAuction",
      "msg": "u are trying to settle an auction that's still open for bidding"
    }
  ]
};

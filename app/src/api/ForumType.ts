export type Forum = {
  "version": "0.1.0",
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
          "isMut": true,
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
          "name": "cardMetadata",
          "isMut": true,
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
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
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
          "isMut": true,
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
          "name": "artifactAuction",
          "isMut": true,
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
          "name": "artifactAuction",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "wrapSession",
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
          "name": "artifactMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactMetadata",
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
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAttribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuctionHouse",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
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
        },
        {
          "name": "tokenMetadataProgram",
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
      "name": "assertWrapSession",
      "accounts": [
        {
          "name": "artifact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuctionHouse",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimSchedule",
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
          "name": "claimScheduleBump",
          "type": "u8"
        },
        {
          "name": "artifactAuctionHouseBump",
          "type": "u8"
        },
        {
          "name": "artifactBump",
          "type": "u8"
        },
        {
          "name": "session",
          "type": "u32"
        }
      ]
    },
    {
      "name": "claimPostReward",
      "accounts": [
        {
          "name": "claimer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fractionalMembershipMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fmTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimSchedule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
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
          "name": "index",
          "type": "u8"
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
            "name": "session",
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
      "name": "artifact",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "session",
            "type": "u32"
          },
          {
            "name": "tokenMint",
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
      "name": "forum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "membership",
            "type": "u32"
          },
          {
            "name": "session",
            "type": "u32"
          },
          {
            "name": "lastDawn",
            "type": "u64"
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
            "name": "session",
            "type": "u32"
          },
          {
            "name": "sessionScore",
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
            "name": "session",
            "type": "u32"
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
            "name": "session",
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
    },
    {
      "name": "claimSchedule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "session",
            "type": "u32"
          },
          {
            "name": "hasClaimed",
            "type": {
              "array": [
                "bool",
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
      "code": 6000,
      "name": "SinglePostPerSession",
      "msg": "post account has already submitted this session"
    },
    {
      "code": 6001,
      "name": "SingleVotePerSession",
      "msg": "vote account has already voted this session"
    },
    {
      "code": 6002,
      "name": "UnauthorizedLeaderboardAccount",
      "msg": "leaderboard account does not match expected, pda seed: 'leaderboard'"
    },
    {
      "code": 6003,
      "name": "SessionNotWrapped",
      "msg": "active session has not ended."
    },
    {
      "code": 6004,
      "name": "LowBallBid",
      "msg": "bid does not meet minimum"
    },
    {
      "code": 6005,
      "name": "BidOnExpiredAuction",
      "msg": "u are trying to bid on an auction that has expired"
    },
    {
      "code": 6006,
      "name": "SettleActiveAuction",
      "msg": "u are trying to settle an auction that's still open for bidding"
    },
    {
      "code": 6007,
      "name": "UnathorizedPostRewards",
      "msg": "u are claiming post rewards that don't belong to you"
    }
  ]
};

export const IDL: Forum = {
  "version": "0.1.0",
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
          "isMut": true,
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
          "name": "cardMetadata",
          "isMut": true,
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
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
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
          "isMut": true,
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
          "name": "artifactAuction",
          "isMut": true,
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
          "name": "artifactAuction",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "wrapSession",
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
          "name": "artifactMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactMetadata",
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
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAttribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuctionHouse",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forum",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
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
        },
        {
          "name": "tokenMetadataProgram",
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
      "name": "assertWrapSession",
      "accounts": [
        {
          "name": "artifact",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifactAuctionHouse",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimSchedule",
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
          "name": "claimScheduleBump",
          "type": "u8"
        },
        {
          "name": "artifactAuctionHouseBump",
          "type": "u8"
        },
        {
          "name": "artifactBump",
          "type": "u8"
        },
        {
          "name": "session",
          "type": "u32"
        }
      ]
    },
    {
      "name": "claimPostReward",
      "accounts": [
        {
          "name": "claimer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fractionalMembershipMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fmTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artifact",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimSchedule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "forumAuthority",
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
          "name": "index",
          "type": "u8"
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
            "name": "session",
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
      "name": "artifact",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "session",
            "type": "u32"
          },
          {
            "name": "tokenMint",
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
      "name": "forum",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "membership",
            "type": "u32"
          },
          {
            "name": "session",
            "type": "u32"
          },
          {
            "name": "lastDawn",
            "type": "u64"
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
            "name": "session",
            "type": "u32"
          },
          {
            "name": "sessionScore",
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
            "name": "session",
            "type": "u32"
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
            "name": "session",
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
    },
    {
      "name": "claimSchedule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "session",
            "type": "u32"
          },
          {
            "name": "hasClaimed",
            "type": {
              "array": [
                "bool",
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
      "code": 6000,
      "name": "SinglePostPerSession",
      "msg": "post account has already submitted this session"
    },
    {
      "code": 6001,
      "name": "SingleVotePerSession",
      "msg": "vote account has already voted this session"
    },
    {
      "code": 6002,
      "name": "UnauthorizedLeaderboardAccount",
      "msg": "leaderboard account does not match expected, pda seed: 'leaderboard'"
    },
    {
      "code": 6003,
      "name": "SessionNotWrapped",
      "msg": "active session has not ended."
    },
    {
      "code": 6004,
      "name": "LowBallBid",
      "msg": "bid does not meet minimum"
    },
    {
      "code": 6005,
      "name": "BidOnExpiredAuction",
      "msg": "u are trying to bid on an auction that has expired"
    },
    {
      "code": 6006,
      "name": "SettleActiveAuction",
      "msg": "u are trying to settle an auction that's still open for bidding"
    },
    {
      "code": 6007,
      "name": "UnathorizedPostRewards",
      "msg": "u are claiming post rewards that don't belong to you"
    }
  ]
};

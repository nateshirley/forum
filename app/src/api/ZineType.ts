export type Zine = {
  "version": "0.0.0",
  "name": "zine",
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
      "args": []
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
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAttribution",
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
          "name": "member",
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
          "name": "memberAttribution",
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
          "name": "memberAttributionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "advanceEpoch",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
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
      "name": "newPost",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "member",
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
          "name": "member",
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
            "name": "lastReset",
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
      "name": "member",
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
      "name": "memberAttribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "member",
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
      "name": "leaderboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
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
    }
  ],
  "types": [
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
      "msg": "leaderboard account does not match expected (fromSeed): 'leaderboard', programId"
    }
  ]
};

export const IDL: Zine = {
  "version": "0.0.0",
  "name": "zine",
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
      "args": []
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
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAttribution",
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
          "name": "member",
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
          "name": "memberAttribution",
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
          "name": "memberAttributionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "advanceEpoch",
      "accounts": [
        {
          "name": "forum",
          "isMut": true,
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
      "name": "newPost",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "member",
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
          "name": "member",
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
            "name": "lastReset",
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
      "name": "member",
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
      "name": "memberAttribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "member",
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
      "name": "leaderboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
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
    }
  ],
  "types": [
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
      "msg": "leaderboard account does not match expected (fromSeed): 'leaderboard', programId"
    }
  ]
};

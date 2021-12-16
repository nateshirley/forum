import React, { FC, useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN, Provider, Wallet, web3 } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { Route, Switch, useHistory } from 'react-router-dom';
import New from '../components/New'
import PostDetails from '../components/PostDetails';
import { getForumProgram } from '../api/config';
import { getArtifactAddress, getArtifactAuctionAddress, getCardTokenAccount, getForumAddress, getLeaderboard } from '../api/addresses';
import { fetchMembershipAccount, fetchMembershipCardMintForWallet } from '../api/membership';
import { fetchedPostAccountToPostObject } from '../api/posts';
import ActiveArtifactAuction from '../components/ActiveArtifactAuction/ActiveArtifactAuction';
import Home from "../components/Home";
import Forum from "../components/Forum/Forum"
import { ArtifactAuction, AUCTION_PHASE, ForumInfo, Membership, Post, Like } from '../interfaces';
import Artifact from '../components/Artifact/Artifact';
import { getNow, numberArrayToString } from '../utils';
import About from '../components/About';
import NetworkChange from '../components/NetworkChange';



const ComponentSwitch: FC = () => {
    const wallet = useWallet();
    const history = useHistory();
    const program = getForumProgram(wallet);
    const [forumInfo, setForumInfo] = useState<ForumInfo | undefined>(undefined);
    const [artifactAuction, setArtifactAuction] = useState<ArtifactAuction | undefined>(undefined);
    const [leaderboard, setLeaderboard] = useState<PublicKey | undefined>(undefined);
    const [membership, setMembership] = useState<Membership | undefined>(undefined);
    const [memberCardMint, setMemberCardMint] = useState<PublicKey | undefined>(undefined);
    const [canLike, setCanLike] = useState(false);
    const [activeUserLike, setActiveUserLike] = useState<Like | undefined>(undefined);
    const [canPost, setCanPost] = useState(false);
    const [activeUserPost, setActiveUserPost] = useState<Post | undefined>(undefined);
    const [cardTokenAccount, setCardTokenAccount] = useState<PublicKey | undefined>(undefined);
    const [auctionPhase, setAuctionPhase] = useState<string | undefined>(undefined);


    useEffect(() => {
        getForumAddress().then(([forum, bump]) => {
            program.account.forum.fetch(forum).then((fetchedInfo) => {
                setForumInfo({
                    publicKey: forum,
                    membership: fetchedInfo.membership as number,
                    session: fetchedInfo.session,
                    lastDawn: fetchedInfo.lastDawn,
                    bump: fetchedInfo.bump,
                })
            });
        });
        getLeaderboard().then(([leaderboard, bump]) => {
            setLeaderboard(leaderboard);
            fetchLeaderboard(leaderboard);
        })
        fetchAuction().then((artifactAuction) => {
            console.log("got the auction")
            setArtifactAuction(artifactAuction);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchLeaderboard = (address: PublicKey) => {
        program.account.leaderboard.fetch(address).then((account: any) => {
            account.posts = account.posts.map((post: any) => {
                post.body = numberArrayToString(post.body)
                return post
            })
            console.log("LEADERBOARD: ", account);
        })
    }


    const fetchAuction = async (): Promise<ArtifactAuction> => {
        return getArtifactAuctionAddress().then(([auctionAddress, bump]) => {
            return program.account.artifactAuction.fetch(auctionAddress).then((response) => {
                return {
                    address: auctionAddress,
                    session: response.session,
                    endTimestamp: response.endTimestamp.toNumber(),
                    leadingBidder: response.leadingBid.bidder,
                    bidLamports: response.leadingBid.lamports.toNumber(),
                    bump: response.bump
                };
            });
        });
    }

    useEffect(() => {
        if (artifactAuction && forumInfo) {
            //need a countdown from this
            determineAuctionPhase(artifactAuction.session, artifactAuction.endTimestamp, forumInfo.session);
        }
    }, [artifactAuction, forumInfo])

    const determineAuctionPhase = (auctionSession: number, endTimestamp: number, forumSession: number) => {
        const now = getNow();
        if (auctionSession === forumSession) {
            if (now - endTimestamp > 0) {
                setAuctionPhase(AUCTION_PHASE.needsSettled);
            } else if (now - endTimestamp < 0) {
                setAuctionPhase(AUCTION_PHASE.isActive);
            }
        } else if (auctionSession < forumSession) {
            setAuctionPhase(AUCTION_PHASE.historical);
        }
    }

    //update member status when wallet is connected/disconnected
    useEffect(() => {
        fetchMembershipCardMintForWallet(program, wallet.publicKey).then((cardMint) => {
            setMemberCardMint(cardMint);
            console.log("(use effect) setting memberCardMint to ", cardMint?.toBase58())
        })
        checkForAirdrop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet.connected])

    const checkForAirdrop = () => {
        if (wallet.connected && wallet.publicKey) {
            program.provider.connection.getBalance(wallet.publicKey).then((devBalance) => {
                if (devBalance < web3.LAMPORTS_PER_SOL) {
                    console.log("airdropping some dev sol")
                    airdrop();
                }
            })
        }
    }
    const airdrop = async () => {
        if (wallet.publicKey) {
            await program.provider.connection.confirmTransaction(
                await program.provider.connection.requestAirdrop(
                    wallet.publicKey,
                    1 * web3.LAMPORTS_PER_SOL
                ),
                "confirmed"
            );
        }
    }
    useEffect(() => {
        if (memberCardMint) {
            fetchMembershipAccount(program, memberCardMint).then((membership) => {
                setMembership(membership);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberCardMint])

    useEffect(() => {
        if (wallet.publicKey && memberCardMint) {
            getCardTokenAccount(wallet.publicKey, memberCardMint).then((account) => {
                setCardTokenAccount(account);
            });
        }
    }, [wallet.publicKey, memberCardMint])

    //TODO: make sure the like account is getting updated when a new like goes through
    useEffect(() => {
        if (forumInfo && membership && auctionPhase) {
            refreshActiveUserLike();
            refreshActiveUserPost();
        } else {
            setCanLike(false);
            setCanPost(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [membership, forumInfo, auctionPhase]);

    const refreshActiveUserLike = () => {
        if (forumInfo && membership && auctionPhase) {
            program.account.vote.fetch(membership.vote).then((likeAccount) => {
                setCanLike(likeAccount.session < forumInfo.session && auctionPhase === AUCTION_PHASE.isActive);
                console.log("found a like", likeAccount.votedForCardMint.toBase58())
                setActiveUserLike({
                    publicKey: membership.vote,
                    authorityCardMint: likeAccount.authorityCardMint,
                    votedForCardMint: likeAccount.votedForCardMint,
                    session: likeAccount.session,
                })
            });
        }
    }
    const refreshActiveUserPost = () => {
        if (forumInfo && membership && auctionPhase) {
            let activeSession = forumInfo.session;
            program.account.post.fetch(membership.post).then((postAccount) => {
                let canPost = postAccount.session < activeSession && auctionPhase === AUCTION_PHASE.isActive;
                setCanPost(canPost);
                if (postAccount.session >= activeSession && membership) {
                    setActiveUserPost(fetchedPostAccountToPostObject(postAccount, membership.post));
                }
            })
        }
    }

    const submitLike = async (post: PublicKey) => {
        if (wallet.publicKey && forumInfo && artifactAuction && membership && cardTokenAccount && leaderboard) {
            return program.rpc.submitVote({
                accounts: {
                    authority: wallet.publicKey,
                    membership: membership.publicKey,
                    forum: forumInfo.publicKey,
                    artifactAuction: artifactAuction.address,
                    leaderboard: leaderboard,
                    post: post,
                    vote: membership.vote,
                    cardMint: membership.cardMint,
                    cardTokenAccount: cardTokenAccount,
                    clock: web3.SYSVAR_CLOCK_PUBKEY
                },
            }).then((sig) => {
                refreshActiveUserLike();
                return sig;
            }).catch(() => {
                return undefined;
            });
        }
    }

    const didSubmitNewPost = () => {
        refreshActiveUserPost();
    }
    const refreshArtifactAuction = () => {
        fetchAuction().then((artifactAuction) => {
            console.log("got the auction")
            setArtifactAuction(artifactAuction);
        })
    }

    return (
        <Switch>
            <Route path="/post">
                <PostDetails canLike={canLike} submitLike={submitLike} />
            </Route>
            <Route path="/session">
                <Artifact artifactAuction={artifactAuction} />
            </Route>
            <Route path="/about">
                <About />
            </Route>
            <Route path="/networkchange">
                <NetworkChange />
            </Route>
            <Route path="/">
                <Home forumInfo={forumInfo} memberCardMint={memberCardMint} membership={membership} leaderboard={leaderboard}
                    artifactAuction={artifactAuction} cardTokenAccount={cardTokenAccount} canPost={canPost} canLike={canLike}
                    activeUserPost={activeUserPost} setMemberCardMint={setMemberCardMint} setCanPost={setCanPost} submitLike={submitLike}
                    refreshArtifactAuction={refreshArtifactAuction} auctionPhase={auctionPhase} activeUserLike={activeUserLike} didSubmitNewPost={didSubmitNewPost}
                />
            </Route>

        </Switch>
    );

}

export default ComponentSwitch;
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from 'react';
import { getForumProgram } from '../../api/config';
import BN from 'bn.js';
import * as web3 from "@solana/web3.js";
import { PublicKey } from '@solana/web3.js';
import "../../Global.css";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getArtifactAddress, getArtifactAuctionAddress, getArtifactAuctionHouseAddress, getForumAuthority } from "../../api/addresses";
import { getNow, numberArrayToString } from "../../utils";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAccountAddress } from "../../api/tokenHelpers";
import { Artifact, Auction, ForumInfo, Membership, Pda, Post } from "../../interfaces";

interface Props {
    forumInfo: ForumInfo | undefined,
    memberCardMint: PublicKey | undefined,
    membership: Membership | undefined,
    leaderboard: PublicKey | undefined,
    cardTokenAccount: PublicKey | undefined,
    activeUserPost: Post | undefined,
}


const AUCTION_PHASE = {
    isActive: "isActive",                 //1
    needsSettled: "needsSettled",         //2
    historical: "historical"              //3
}

function ActiveArtifactAuction(props: Props) {
    const wallet = useWallet();
    const [postRefresh, doPostRefresh] = useState(0);
    const program = getForumProgram(wallet);
    const [artifact, setArtifact] = useState<Artifact | undefined>(undefined);
    const [auction, setAuction] = useState<Auction | undefined>(undefined);
    const [auctionPhase, setAuctionPhase] = useState<string | undefined>(undefined);
    const [auctionHouse, setAuctionHouse] = useState<Pda | undefined>(undefined);
    const [forumAuthority, setForumAuthority] = useState<Pda | undefined>(undefined);
    const [winnerTokenAccount, setWinnerTokenAccount] = useState<PublicKey | undefined>(undefined);
    useEffect(() => {
        if (auctionPhase === AUCTION_PHASE.needsSettled || auctionPhase === AUCTION_PHASE.isActive) {
            getArtifactAuctionHouseAddress().then(([auctionHouse, auctionHouseBump]) => {
                setAuctionHouse({
                    address: auctionHouse,
                    bump: auctionHouseBump
                });
            });
        }
        if (auctionPhase === AUCTION_PHASE.needsSettled && auction?.leadingBidder && artifact?.cardMint) {
            getAssociatedTokenAccountAddress(
                auction?.leadingBidder,
                artifact?.cardMint
            ).then((address) => {
                setWinnerTokenAccount(address);
            });
            getForumAuthority().then(([authority, bump]) => {
                setForumAuthority({
                    address: authority,
                    bump: bump
                })
            })
        } else {
            setWinnerTokenAccount(undefined);
        }
    }, [artifact?.cardMint, auction?.leadingBidder, auctionPhase])

    //show historical sessions on same page
    /*
    next
    - get the auction details
    - get the artifact details
    - place bid
    - advance epoch
    */

    //get the artifact object
    useEffect(() => {
        if (props.forumInfo) {
            getArtifactAddress(
                props.forumInfo.epoch
            ).then(([artifactAddress, bump]) => {
                console.log(artifactAddress.toBase58())
                program.account.artifact.fetch(artifactAddress).then((fetchedArtifact) => {
                    let posts: any = fetchedArtifact.posts;
                    let artifactPosts = posts.map((post: any) => {
                        return {
                            cardMint: post.cardMint,
                            body: numberArrayToString(post.body),
                            link: numberArrayToString(post.link),
                            score: post.score
                        }
                    });
                    setArtifact({
                        address: artifactAddress,
                        epoch: fetchedArtifact.epoch,
                        cardMint: fetchedArtifact.cardMint,
                        posts: artifactPosts,
                        bump: fetchedArtifact.bump
                    })
                    console.log({
                        address: artifactAddress,
                        epoch: fetchedArtifact.epoch,
                        cardMint: fetchedArtifact.cardMint,
                        posts: artifactPosts,
                        bump: fetchedArtifact.bump
                    });
                }).catch((e) => {
                    console.log("failed to get the artifact object")
                })
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.forumInfo])


    //get the artifact auction details
    useEffect(() => {
        if (props.forumInfo) {
            getArtifactAuctionAddress().then(([artifactAuctionAddress, bump]) => {
                try {
                    program.account.artifactAuction.fetch(artifactAuctionAddress).then((fetchedAuctionState) => {
                        let auction = {
                            address: artifactAuctionAddress,
                            epoch: fetchedAuctionState.epoch,
                            endTimestamp: fetchedAuctionState.endTimestamp.toNumber(),
                            leadingBidder: fetchedAuctionState.leadingBid.bidder,
                            bidLamports: fetchedAuctionState.leadingBid.lamports.toNumber(),
                            bump: fetchedAuctionState.bump
                        }
                        setAuction(auction);
                        let now = getNow();
                        let end = auction.endTimestamp;
                        let forumEpoch = props.forumInfo?.epoch ?? -1;
                        console.log("seconds until auction ends: ", auction.endTimestamp - now);
                        console.log(auctionPhase);
                        if (fetchedAuctionState.epoch === forumEpoch) { //dealing with present auction
                            if (now - end > 0) {
                                console.log("auction needs to be settled");
                                setAuctionPhase(AUCTION_PHASE.needsSettled);
                            } else if (now - end < 0) {
                                console.log("auction is active");
                                setAuctionPhase(AUCTION_PHASE.isActive);
                            }
                        } else if (fetchedAuctionState.state < forumEpoch) { //dealing with an auction that has already ended
                            console.log("historical auction")
                            setAuctionPhase(AUCTION_PHASE.historical);
                        }

                    })
                } catch (e) {
                    console.log("failed to fetch artifact auction ")
                }

            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.forumInfo]);

    useEffect(() => {
        // program.provider.connection.getBlockTime(137368).then((time) => {
        //     console.log(time, "TIME")
        // });
    }, [])






    const didPressSettle = () => {
        if (props.forumInfo && auction && artifact && auctionHouse && winnerTokenAccount && forumAuthority) {
            settleAndAdvance(
                props.forumInfo.publicKey,
                artifact.address,
                auction.address,
                artifact.cardMint,
                winnerTokenAccount,
                auction.leadingBidder,
                auctionHouse.address,
                auctionHouse.bump,
                forumAuthority.address
            ).then((sig) => {
                //not sure if this is best
                window.location.reload();
            })
        }
        //add stuff to update ui

    }
    const settleAndAdvance = async (forumAddress: PublicKey, artifactAddress: PublicKey, artifactAuctionAddress: PublicKey, artifactCardMint: PublicKey,
        artifactTokenAccount: PublicKey, winner: PublicKey, auctionHouse: PublicKey, auctionHouseBump: number, forumAuthority: PublicKey) => {
        const program = getForumProgram(wallet);
        const tx = await program.rpc.settleArtifactAuctionAndAdvanceEpoch(
            auctionHouseBump,
            {
                accounts: {
                    artifact: artifactAddress,
                    artifactCardMint: artifactCardMint,
                    artifactTokenAccount: artifactTokenAccount,
                    winner: winner,
                    artifactAuction: artifactAuctionAddress,
                    artifactAuctionHouse: auctionHouse,
                    forum: forumAddress,
                    forumAuthority: forumAuthority,
                    clock: web3.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                instructions: [
                    createAssociatedTokenAccountInstruction(
                        artifactCardMint,
                        artifactTokenAccount,
                        winner,
                        program.provider.wallet.publicKey
                    ),
                ],
            }
        );
        return tx
    }

    const didPressBid = () => {
        if (wallet.publicKey && props.forumInfo && auction && artifact && auctionHouse) {
            placeBidForArtifact(
                wallet.publicKey,
                auction.leadingBidder,
                auction.address,
                auctionHouse.address,
                auctionHouse.bump,
                1
            )
        }
    }
    const placeBidForArtifact = (bidder: PublicKey, newestLoser: PublicKey, artifactAuction: PublicKey, auctionHouse: PublicKey, auctionHouseBump: number, bid: number) => {
        const tx = program.rpc.placeBidForArtifact(
            auctionHouseBump,
            new BN(bid * web3.LAMPORTS_PER_SOL),
            {
                accounts: {
                    bidder: bidder,
                    newestLoser: newestLoser,
                    artifactAuction: artifactAuction,
                    artifactAuctionHouse: auctionHouse,
                    clock: web3.SYSVAR_CLOCK_PUBKEY,
                    systemProgram: web3.SystemProgram.programId,
                },
            }
        );
    }

    //should def kick start auction to a different component and just use this for active/historical
    //1. start auction
    //2. bid
    //3. settle auction and advance epoch

    let header = <div>let me see the auction</div>;

    let settle;
    let bid = <button onClick={didPressBid}>bid</button>;
    if (auctionPhase === AUCTION_PHASE.needsSettled) {
        settle = <button onClick={didPressSettle}>settle it</button>
    } else if (auctionPhase === AUCTION_PHASE.isActive) {
        bid = <button onClick={didPressBid}>bid</button>;
    }

    let artifactElement;
    if (artifact) {
        artifactElement = (
            <div>
                this is the artifact
                <div>
                    epoch: {artifact.epoch}
                </div>
                <div>
                    top post
                    <div>
                        body: {artifact.posts[0].body}
                    </div>
                    <div>
                        score: {artifact.posts[0].score}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="component-parent">
            artifact auction
            <div>{header}</div>
            <div>{artifactElement}</div>
            <div>{settle}</div>
            <div>{bid}</div>
        </div>
    );
}
export default ActiveArtifactAuction;
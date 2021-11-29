import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from 'react';
import { getForumProgram } from '../../api/config';
import BN from 'bn.js';
import * as web3 from "@solana/web3.js";
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import "../../Global.css";
import { getArtifactAddress, getArtifactAttributionAddress, getArtifactAuctionAddress, getArtifactAuctionHouseAddress, getForumAuthority } from "../../api/addresses";
import { displayCountdown, getNow, numberArrayToString } from "../../utils";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAccountAddress } from "../../api/tokenHelpers";
import { Artifact, ArtifactAuction, ForumInfo, Membership, Pda, Post } from "../../interfaces";
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";

interface Props {
    forumInfo: ForumInfo | undefined,
    memberCardMint: PublicKey | undefined,
    membership: Membership | undefined,
    leaderboard: PublicKey | undefined,
    cardTokenAccount: PublicKey | undefined,
    activeUserPost: Post | undefined,
}


//only showing active or needs settled
const AUCTION_PHASE = {
    isActive: "isActive",                 //1
    needsSettled: "needsSettled",         //2
    historical: "historical"              //3
}
//.0196 approx tx fee to settle the auction from the house pda
function ActiveArtifactAuction(props: Props) {
    const wallet = useWallet();
    const [postRefresh, doPostRefresh] = useState(0);
    const program = getForumProgram(wallet);
    const [auction, setAuction] = useState<ArtifactAuction | undefined>(undefined);
    const [auctionPhase, setAuctionPhase] = useState<string | undefined>(undefined);
    const [auctionHouse, setAuctionHouse] = useState<Pda | undefined>(undefined);
    const [forumAuthority, setForumAuthority] = useState<Pda | undefined>(undefined);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    // const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | undefined>(undefined);
    const [counter, setCounter] = useState(60);

    useEffect(() => {
        fetchAuction().then((artifactAuction) => {
            setAuction(artifactAuction);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    useEffect(() => {
        if (auction && props.forumInfo) {
            //need a countdown from this
            determineAuctionPhase(auction.session, auction.endTimestamp, props.forumInfo.session);
            determineCountdownSeconds(auction.endTimestamp)
        }
    }, [auction, props.forumInfo])

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

    const determineCountdownSeconds = (endTimestamp: number) => {
        const now = getNow();
        let secondsRemaining = endTimestamp - now;
        setSecondsRemaining(secondsRemaining)
    }
    useEffect(() => {
        const timerId = setInterval(() => tick(), 1000);
        return () => clearInterval(timerId);
    });
    const tick = () => {
        if (secondsRemaining > 0) {
            setSecondsRemaining(secondsRemaining - 1);
        }
    }

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

    useEffect(() => {
        if (auctionPhase === AUCTION_PHASE.needsSettled || auctionPhase === AUCTION_PHASE.isActive) {
            getArtifactAuctionHouseAddress().then(([auctionHouse, auctionHouseBump]) => {
                console.log("houuuuse", auctionHouse.toBase58());
                setAuctionHouse({
                    address: auctionHouse,
                    bump: auctionHouseBump
                });
            });
        }
        if (auctionPhase === AUCTION_PHASE.needsSettled && auction?.leadingBidder) {
            getForumAuthority().then(([authority, bump]) => {
                setForumAuthority({
                    address: authority,
                    bump: bump
                })
            })
        }
    }, [auction?.leadingBidder, auctionPhase])

    //show historical sessions on same page
    /*
    next
    - get the auction details
    - get the artifact details
    - place bid
    - advance epoch
    */


    const didPressWrapSession = async () => {
        if (props.forumInfo && wallet.publicKey && auction && props.leaderboard && auctionHouse) {
            //TODO: add loading indicator. look into making it cheaper
            executeWrapSession(
                wallet.publicKey,
                props.forumInfo.publicKey,
                auction.address,
                auctionHouse,
                auction.leadingBidder,
                props.leaderboard,
                props.forumInfo.session
            ).then((sig) => {
                if (sig.length > 1) {
                    console.log("tx sig: ", sig)
                    window.location.reload();
                } else {
                    console.log("an error occured with the artifact build");
                }
            });

        }
    }
    const executeWrapSession = async (payer: PublicKey, forum: PublicKey, artifactAuction:
        PublicKey, artifactAuctionHouse: Pda, winner: PublicKey, leaderboard: PublicKey, session: number): Promise<string> => {
        let artifactCardMint = Keypair.generate();
        //let [artifactAttribution, artifactAttributionBump]
        const attr = getArtifactAttributionAddress(artifactCardMint.publicKey);
        //let [_forumAuthority, _forumAuthorityBump]
        const auth = getForumAuthority();
        const mintRent = program.provider.connection.getMinimumBalanceForRentExemption(
            MintLayout.span
        );
        const winnerTokenAccount = getAssociatedTokenAccountAddress(
            winner,
            artifactCardMint.publicKey
        )
        const fetchArtifact = getArtifactAddress(session);
        let response = await Promise.all([attr, auth, mintRent, winnerTokenAccount, fetchArtifact]).then(async (values) => {
            let artifactAttribution = values[0][0];
            let artifactAttributionBump = values[0][1];
            let forumAuthority = values[1][0]
            let mintRent = values[2];
            let winnerTokenAccount = values[3]
            let artifact = {
                address: values[4][0],
                bump: values[4][1]
            }
            return await program.rpc.assertArtifactDiscriminator({
                accounts: {
                    artifact: artifact.address,
                },
                instructions: [
                    //create artifact mint
                    SystemProgram.createAccount({
                        fromPubkey: payer,
                        newAccountPubkey: artifactCardMint.publicKey,
                        space: MintLayout.span,
                        lamports: mintRent,
                        programId: TOKEN_PROGRAM_ID,
                    }),
                    //init the mint
                    Token.createInitMintInstruction(
                        TOKEN_PROGRAM_ID,
                        artifactCardMint.publicKey,
                        0,
                        forumAuthority,
                        forumAuthority
                    ),
                    //create token account for winner
                    createAssociatedTokenAccountInstruction(
                        artifactCardMint.publicKey,
                        winnerTokenAccount,
                        winner,
                        payer
                    ),
                    program.instruction.wrapSession(
                        artifactAuctionHouse.bump,
                        artifactAttributionBump,
                        artifact.bump,
                        {
                            accounts: {
                                initializer: payer,
                                artifact: artifact.address,
                                artifactCardMint: artifactCardMint.publicKey,
                                artifactTokenAccount: winnerTokenAccount,
                                winner: winner,
                                artifactAuction: artifactAuction,
                                artifactAttribution: artifactAttribution,
                                artifactAuctionHouse: artifactAuctionHouse.address,
                                forum: forum,
                                forumAuthority: forumAuthority,
                                leaderboard: leaderboard,
                                clock: web3.SYSVAR_CLOCK_PUBKEY,
                                tokenProgram: TOKEN_PROGRAM_ID,
                                systemProgram: SystemProgram.programId,
                            },
                        }
                    ),
                ],
                signers: [artifactCardMint],
            });
        }).catch((e) => {
            return "e"
        })
        return response
    }

    const didPressBid = () => {
        if (wallet.publicKey && props.forumInfo && auction && auctionHouse) {
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

    let header = <div>let me see the auction</div>;

    let actionButton;
    let bid = <button onClick={didPressBid}>bid</button>;
    if (auctionPhase === AUCTION_PHASE.needsSettled) {
        actionButton = <button onClick={didPressWrapSession}>wrap session</button>
    } else if (auctionPhase === AUCTION_PHASE.isActive) {
        actionButton = <button onClick={didPressBid}>bid</button>;
    }

    return (
        <div>
            artifact auction
            <div>{header}</div>
            <div>{displayCountdown(secondsRemaining)}</div>
            <div>{actionButton}</div>
            {/* <div>{bid}</div> */}
            <br />
            <br />
            <br />
        </div>
    );
}
export default ActiveArtifactAuction;
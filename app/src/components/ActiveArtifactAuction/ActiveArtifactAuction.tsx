import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from 'react';
import { getForumProgram } from '../../api/config';
import BN from 'bn.js';
import * as web3 from "@solana/web3.js";
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import "../../Global.css";
import { getArtifactAddress, getArtifactAttributionAddress, getArtifactAuctionAddress, getArtifactAuctionHouseAddress, getForumAuthority } from "../../api/addresses";
import { establishedTextFor, getNow, minBid, numberArrayToString, toDisplayString } from "../../utils";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAccountAddress } from "../../api/tokenHelpers";
import { Artifact, ArtifactAuction, AUCTION_PHASE, ForumInfo, Membership, Pda, Post } from "../../interfaces";
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import Countdown from "./Countdown";
import { useHistory } from "react-router";
import { Row, Col, Container } from "react-bootstrap";
import { useEasybase } from 'easybase-react';


interface Props {
    forumInfo: ForumInfo | undefined,
    artifactAuction: ArtifactAuction | undefined,
    memberCardMint: PublicKey | undefined,
    membership: Membership | undefined,
    leaderboard: PublicKey | undefined,
    cardTokenAccount: PublicKey | undefined,
    activeUserPost: Post | undefined,
    refreshArtifactAuction: () => void,
    auctionPhase: string | undefined,
}



//.0196 approx tx fee to settle the auction from the house pda
function ActiveArtifactAuction(props: Props) {
    const wallet = useWallet();
    const program = getForumProgram(wallet);
    const [auctionHouse, setAuctionHouse] = useState<Pda | undefined>(undefined);
    const [placeBidInput, setPlaceBidInput] = useState("");
    const [estText, setEstText] = useState("");
    const history = useHistory();
    let auction = props.artifactAuction;
    const { db, useReturn } = useEasybase();

    useEffect(() => {
        getArtifactAuctionHouseAddress().then(([auctionHouse, auctionHouseBump]) => {
            setAuctionHouse({
                address: auctionHouse,
                bump: auctionHouseBump
            });
        });
    }, [auction?.leadingBidder, props.auctionPhase])

    useEffect(() => {
        if (props.forumInfo) {
            let startTime = new Date(props.forumInfo.lastDawn.toNumber() * 1000);
            setEstText(establishedTextFor(startTime));
        }
    }, [props.forumInfo])

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
            //TODO: add loading indicator
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
                    if (props.forumInfo && auction) {
                        console.log('inserting')
                        db("FORUMSESSIONS").insert({
                            session: props.forumInfo.session,
                            winningLamports: auction.bidLamports,
                            wrapTxSignature: sig,
                        }).one().then(() => {
                            window.location.reload();
                        });
                    }
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
            console.log(e);
            console.log("GOT AN ERR")
            return "e"
        })
        return response
    }

    const didPressBid = () => {
        if (wallet.publicKey && props.forumInfo && auction && auctionHouse) {
            let amount = parseFloat(placeBidInput);
            console.log(amount)
            placeBidForArtifact(
                wallet.publicKey,
                auction.leadingBidder,
                auction.address,
                auctionHouse.address,
                auctionHouse.bump,
                amount
            ).then((sig) => {
                console.log(sig);
                props.refreshArtifactAuction();
                //add bid to history
                setPlaceBidInput("");
            })
        }
    }

    const placeBidForArtifact = (bidder: PublicKey, newestLoser: PublicKey, artifactAuction: PublicKey, auctionHouse: PublicKey, auctionHouseBump: number, amount: number) => {
        return program.rpc.placeBidForArtifact(
            auctionHouseBump,
            new BN(amount * web3.LAMPORTS_PER_SOL),
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

    const styles = {
        grid: {
            paddingLeft: 0,
            paddingRight: 0
        },
        row: {
            marginLeft: 0,
            marginRight: 0
        },
        col: {
            paddingLeft: 0,
            paddingRight: 0
        }
    };
    const onPlaceBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = e.target.value;
        if (!amount || amount.match(/^\d{1,}(\.\d{0,5})?$/)) {
            setPlaceBidInput(amount);
        }
    };

    const clickedLeft = () => {
        let nextArtifact = auction?.session ? auction.session - 1 : undefined
        if (nextArtifact) {
            history.push("/session/" + nextArtifact);
        }
    }
    const clickedRight = () => {
        console.log("u can't click right")
    }

    const testDb = () => {
        db("FORUMSESSIONS").insert({
            session: 999999999,
            winningLamports: 101010101010,
            wrapTxSignature: "injection",
        }).one();
    }

    let headerElement;
    let bidElement;
    let actionElement;
    if (auction) {
        headerElement = (
            <div>
                <div className="accent-text session-date">{estText}</div>
                <div className="session-header">
                    Session #{auction.session}
                    <button className="session-nav-button left" onClick={clickedLeft}>←</button> <button onClick={clickedRight} className="session-nav-button right">→</button>
                </div>
                <button onClick={testDb}>dbtest</button>
            </div>
        );
        if (props.auctionPhase === AUCTION_PHASE.needsSettled) {
            actionElement = (
                <div>
                    <button className="wrap-session" onClick={didPressWrapSession}>wrap session</button>
                    <div className="bid-leader">winner: {toDisplayString(auction.leadingBidder)}</div>
                </div>
            );
        } else if (props.auctionPhase === AUCTION_PHASE.isActive) {
            actionElement = (
                <div className="bid-action">
                    <input
                        placeholder=""
                        onChange={e => onPlaceBidAmountChange(e)}
                        value={placeBidInput}
                        className="bid-input"
                    />
                    <button className="bid-button" onClick={didPressBid}>bid</button>
                    <div className="bid-leader">leader: {auction.bidLamports > 0
                        ? toDisplayString(auction.leadingBidder)
                        : <span></span>
                    }</div>
                </div>
            );
        }
        bidElement = (
            <div className="bid-element">
                <div className="bid-content">
                    <Row className="m-1" >
                        <Col xl={3} style={styles.col}>
                            <div className="accent-text">current bid</div>
                            <div className="auction-number">{auction.bidLamports / web3.LAMPORTS_PER_SOL}<span className="auction-secondary-element"> sol</span></div>
                        </Col>
                        <Col style={styles.col}>
                            <div className="time-remaining">
                                <div className="accent-text">ends in</div>
                                <Countdown auctionEndTimestamp={auction.endTimestamp} />
                            </div>
                        </Col>
                    </Row>
                    <div className="action-element">
                        <div className="minimum-bid">min bid: {minBid(auction.bidLamports)} SOL</div>
                        {actionElement}
                    </div>

                </div>
            </div>
        );
    }


    return (
        <div>
            {headerElement}
            {bidElement}
            <br />
            <br />
            <br />
        </div>
    );
}
export default ActiveArtifactAuction;
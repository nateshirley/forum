import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from 'react';
import { getForumProgram } from '../../api/config';
import BN from 'bn.js';
import * as web3 from "@solana/web3.js";
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import "../../Global.css";
import { getArtifactAddress, getArtifactAttributionAddress, getArtifactAuctionAddress, getArtifactAuctionHouseAddress, getForumAuthority } from "../../api/addresses";
import { displayCountdown, getNow, minBid, numberArrayToString, toDisplayString } from "../../utils";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAccountAddress } from "../../api/tokenHelpers";
import { Artifact, ArtifactAuction, AUCTION_PHASE, ForumInfo, Membership, Pda, Post } from "../../interfaces";
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import Countdown from "./Countdown";
import { useHistory } from "react-router";

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
    const history = useHistory();
    let auction = props.artifactAuction;

    useEffect(() => {
        getArtifactAuctionHouseAddress().then(([auctionHouse, auctionHouseBump]) => {
            setAuctionHouse({
                address: auctionHouse,
                bump: auctionHouseBump
            });
        });
    }, [auction?.leadingBidder, props.auctionPhase])

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
            let amount = parseFloat(placeBidInput);
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
    let arrowButtons = (
        <div>
            <button onClick={clickedLeft}>←</button> <button onClick={clickedRight}>→</button>
        </div>
    );
    let infoElement;
    let newBidElement;
    let actionElement;
    if (auction) {
        infoElement = (
            <div>
                <div>Session #{auction.session}</div>
                <div>Current bid: {auction.bidLamports / web3.LAMPORTS_PER_SOL} SOL</div>
                <Countdown auctionEndTimestamp={auction.endTimestamp} />
            </div>
        );
        if (props.auctionPhase === AUCTION_PHASE.needsSettled) {
            actionElement = (
                <div>
                    <button onClick={didPressWrapSession}>wrap session</button>
                    <div>winner: {toDisplayString(auction.leadingBidder)}</div>
                </div>
            );
        } else if (props.auctionPhase === AUCTION_PHASE.isActive) {
            actionElement = (
                <div>
                    <input
                        placeholder=""
                        onChange={e => onPlaceBidAmountChange(e)}
                        value={placeBidInput}
                        className="default-input"
                    />
                    <button onClick={didPressBid}>bid</button>
                    <div>leader: {toDisplayString(auction.leadingBidder)}</div>
                </div>
            );
        }
        newBidElement = (
            <div>
                <div>minimum bid: {minBid(auction.bidLamports)} SOL</div>
                {actionElement}
            </div>
        );
    }


    return (
        <div>
            {arrowButtons}
            {infoElement}
            {newBidElement}
            <br />
            <br />
            <br />
        </div>
    );
}
export default ActiveArtifactAuction;
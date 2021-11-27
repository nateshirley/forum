import { useEffect, useState } from "react";
import { PublicKey, Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, MintLayout } from "@solana/spl-token";
import { getArtifactAddress, getArtifactAttributionAddress, getArtifactAuctionAddress, getForumAuthority, getLeaderboard } from "./../api/addresses";
import { useWallet } from "@solana/wallet-adapter-react";
import { getForumProgram } from "../api/config";
import { useHistory } from "react-router";
import { ForumInfo, Pda } from "../interfaces";

interface Props {
    forumInfo: ForumInfo | undefined,
    leaderboard: PublicKey | undefined,
}

function WrapSession(props: Props) {
    const wallet = useWallet();
    const program = getForumProgram(wallet);
    const history = useHistory();
    const [artifact, setArtifact] = useState<Pda | undefined>(undefined);
    const [artifactAuction, setArtifactAuction] = useState<Pda | undefined>(undefined);

    useEffect(() => {
        if (props.forumInfo) {
            getArtifactAddress(props.forumInfo.epoch).then(([address, bump]) => {
                setArtifact({
                    address: address,
                    bump: bump
                })
            })
            getArtifactAuctionAddress().then(([address, bump]) => {
                setArtifactAuction({
                    address: address,
                    bump: bump
                })
            })
        }
    }, [props.forumInfo])

    const didPressStartAuction = () => {
        if (props.forumInfo && wallet.publicKey && artifact && artifactAuction && props.leaderboard) {
            buildArtifactAndStartAuction(
                wallet.publicKey,
                props.forumInfo.publicKey,
                artifact.address,
                artifact.bump,
                artifactAuction.address,
                props.leaderboard,
            ).then((sig) => {
                console.log("started")
                history.push("active-artifact");
            });
        }

    }
    const buildArtifactAndStartAuction = async (payer: PublicKey, forum: PublicKey, artifact: PublicKey, artifactBump: number, artifactAuction: PublicKey, leaderboard: PublicKey) => {
        let artifactCardMint = Keypair.generate();
        //let [artifactAttribution, artifactAttributionBump]
        const attr = await getArtifactAttributionAddress(artifactCardMint.publicKey);
        //let [_forumAuthority, _forumAuthorityBump]
        const auth = await getForumAuthority();
        Promise.all([attr, auth]).then(async (values) => {
            let artifactAttribution = values[0][0];
            let artifactAttributionBump = values[0][1];
            let forumAuthority = values[1][0]
            const tx = await program.rpc.startArtifactAuction({
                accounts: {
                    artifact: artifact,
                    artifactAuction: artifactAuction,
                    forum: forum,
                },
                instructions: [
                    SystemProgram.createAccount({
                        fromPubkey: payer,
                        newAccountPubkey: artifactCardMint.publicKey,
                        space: MintLayout.span,
                        lamports: await program.provider.connection.getMinimumBalanceForRentExemption(
                            MintLayout.span
                        ),
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
                    program.instruction.buildArtifact(
                        artifactAttributionBump,
                        artifactBump,
                        {
                            accounts: {
                                initializer: payer,
                                artifact: artifact,
                                artifactCardMint: artifactCardMint.publicKey,
                                artifactAttribution: artifactAttribution,
                                forum: forum,
                                forumAuthority: forumAuthority,
                                leaderboard: leaderboard,
                                clock: SYSVAR_CLOCK_PUBKEY,
                                systemProgram: SystemProgram.programId,
                            },
                        }
                    ),
                ],
                signers: [artifactCardMint],
            });
            return tx
        })
    }


    return (
        <div className="component-parent">
            <div>wrap</div>
            <button onClick={didPressStartAuction}>wrap session and start auction</button>
        </div>
    )
}



export default WrapSession;
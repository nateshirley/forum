
import { useState, useEffect } from "react";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Provider, Program, utils } from '@project-serum/anchor';
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchMembershipCardMintForWallet } from "../../api/membership";
import { getForumProgram, getProvider, getMintConfig } from '../../api/config'
import { mintMembership } from "../../api/membership";
import { toDisplayString } from "../../utils"
/*
if member {
    - show welcome
    - if posted
        show post
    else 
        show dialogue box to post
} else {
    claim membership button
}
*/

interface Props {
    memberCardMint: PublicKey | undefined,
    setMemberCardMint: (cardMint: PublicKey | undefined) => void;
}


function MembershipHeader(props: Props) {
    let wallet = useWallet();
    let program = getForumProgram(wallet);


    const didPressMintMembership = () => {
        if (wallet.publicKey) {
            getMintConfig(wallet.publicKey).then((mintConfig) => {
                mintMembership(mintConfig, getProvider(wallet)).then(() => {
                    fetchMembershipCardMintForWallet(program, wallet.publicKey).then((cardMint) => {
                        props.setMemberCardMint(cardMint);
                        console.log("(use effect) setting isMember to ", cardMint?.toBase58())
                    })
                })
            });
        }
    }

    if (props.memberCardMint) {
        return (
            <div>
                Hello, friend {toDisplayString(props.memberCardMint)}
            </div>
        )
    } else {
        return (
            <div>
                <button onClick={didPressMintMembership}>mint membership</button>
            </div>
        )
    }
}
export default MembershipHeader;

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


function MembershipHeader() {
    let [memberCardMint, setMemberCardMint] = useState<PublicKey | undefined>(undefined);
    let wallet = useWallet();
    let program = getForumProgram(wallet);

    //update member status when wallet is connected/disconnected
    useEffect(() => {
        fetchMembershipCardMintForWallet(program, wallet.publicKey).then((cardMint) => {
            setMemberCardMint(cardMint);
            console.log("(use effect) setting isMember to ", cardMint?.toBase58())
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet.connected])

    const didPressMintMembership = () => {
        if (wallet.publicKey) {
            getMintConfig(wallet.publicKey).then((mintConfig) => {
                mintMembership(mintConfig, getProvider(wallet)).then(() => {
                    fetchMembershipCardMintForWallet(program, wallet.publicKey).then((cardMint) => {
                        setMemberCardMint(cardMint);
                        console.log("(use effect) setting isMember to ", cardMint?.toBase58())
                    })
                })
            });
        }
    }

    if (memberCardMint) {
        return (
            <div>
                Hello, friend {toDisplayString(memberCardMint)}
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
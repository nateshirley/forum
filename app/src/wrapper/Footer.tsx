import { getPublicProvider } from '../api/config';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useHistory } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";

function Footer() {
    let wallet = useWallet();
    const history = useHistory();

    const airdrop = async () => {
        if (wallet.publicKey) {
            toast("confirming...")
            const provider = getPublicProvider(wallet);
            const tx = await provider.connection.requestAirdrop(
                wallet.publicKey,
                1 * LAMPORTS_PER_SOL
            )
            const confirmation = await provider.connection.confirmTransaction(
                tx,
                "confirmed"
            );
            if (confirmation.value.err) {
                toast("an error occurred", {
                    icon: '🥲'
                })
            } else {
                toast("airdropped 1 sol", {
                    icon: '💸'
                })
            }
        } else {
            toast('wallet not connected', {
                icon: '🪙',
            });
        }
    }
    const about = () => {
        history.push("/about")
    }
    return (
        <div style={{ textAlign: "center", paddingBottom: "20px" }}>
            <button onClick={airdrop} className="airdrop">airdrop</button>
            <button onClick={about} className="about">about</button>
        </div>
    )
}
export default Footer;
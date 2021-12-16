import { getProvider } from '../api/config';
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
            const provider = getProvider(wallet);
            await provider.connection.confirmTransaction(
                await provider.connection.requestAirdrop(
                    wallet.publicKey,
                    5 * LAMPORTS_PER_SOL
                ),
                "confirmed"
            );
            toast("airdropped 5 sol", {
                icon: '💸'
            })
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
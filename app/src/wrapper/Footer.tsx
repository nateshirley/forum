import { getProvider } from '../api/config';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useHistory } from 'react-router-dom';

function Footer() {
    let wallet = useWallet();
    const history = useHistory();

    const airdrop = async () => {
        if (wallet.publicKey) {
            const provider = getProvider(wallet);
            await provider.connection.confirmTransaction(
                await provider.connection.requestAirdrop(
                    wallet.publicKey,
                    5 * LAMPORTS_PER_SOL
                ),
                "confirmed"
            );
        }
    }
    const about = () => {
        history.push("/about")
    }
    return (
        <div style={{ textAlign: "center", paddingBottom: "20px" }}>
            <button onClick={airdrop}>airdrop</button>
            <button onClick={about} className="about">about</button>
        </div>
    )
}
export default Footer;
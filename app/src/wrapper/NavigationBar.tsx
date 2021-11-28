import { useWallet } from '@solana/wallet-adapter-react';
import { Link, useLocation } from 'react-router-dom';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { FC } from 'react';
import logo from "../assets/record.png"
import "./wrapper.css"
import { getProvider } from '../api/config';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const NavigationBar: FC = () => {
    let wallet = useWallet();
    const location = useLocation();
    let connectStyle = {
        color: "black",
        backgroundColor: "white",
        border: '2px solid rgba(0, 0, 0, 1)',
        fontFamily: "IBM Plex Sans",
        fontWeight: 600
    }

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

    let shouldShowConnect = location.pathname !== "/forum" || wallet.connected;


    return (
        <nav className="navbar">
            <Link to="/"><img src={logo} alt="home" className="logo" /></Link>
            <button onClick={airdrop}>airdrop</button>
            <div >
                {/* <Link to="/make">+make</Link> */}
                {shouldShowConnect && (
                    <div className="nav-wallet-button-outer">
                        <div className="nav-wallet-button"><WalletMultiButton style={connectStyle} /></div>
                        {wallet.connected && <WalletDisconnectButton style={connectStyle} className="nav-wallet-button disconnect" />}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavigationBar;

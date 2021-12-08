import { useWallet } from '@solana/wallet-adapter-react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { FC } from 'react';
import "./wrapper.css"
import "./nav.css"

const NavigationBar: FC = () => {
    let wallet = useWallet();
    const location = useLocation();
    const history = useHistory();
    let connectStyle = {
        color: "black",
        backgroundColor: "white",
        opacity: "0.8",
        border: '0px solid rgba(0, 0, 0, 1)',
        fontFamily: "IBM Plex Sans",
        fontSize: "16px",
        fontWeight: 500,
        marginTop: "7px"
    }



    let shouldShowConnect = location.pathname !== "/" || wallet.connected;

    let homeElement = (
        <div>
            <a href="https://www.yelllow.xyz" target="_blank" rel="noreferrer noopener">
                <svg viewBox="-5 -5 35 35">
                    <text y="20">y/</text>
                    <text y="20" className="ytop">y/</text>
                </svg>
            </a>
            <div>
                <Link to="/" className="prh-link">ParisRadioHour</Link>
            </div>
        </div>
    )


    return (
        <nav className="navbar">
            {homeElement}

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

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import "../../Global.css"

function ConnectWallet() {
    let connectStyle = {
        borderRadius: '0px',
        color: "white",
        backgroundColor: "#000069",
        border: '0px solid #00288F',
        fontFamily: "Inconsolata",
        fontWeight: 900,
        width: '100%',
        height: '100%',
        fontSize: '21px'
    }

    let wallet = useWallet();
    if (!wallet.connected) {
        return (
            <div className="push-greeting">
                <div className="connect-button-parent">
                    <WalletMultiButton style={connectStyle}>CONNECT WALLET</WalletMultiButton>
                </div>
            </div>
        )
    } else {
        return <div></div>
    }
}

export default ConnectWallet;
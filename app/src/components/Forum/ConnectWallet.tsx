import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import "../../Global.css"

function ConnectWallet() {
    let connectStyle = {
        color: "white",
        backgroundColor: "black",
        border: '0px solid #00288F',
        borderRadius: "5px",
        fontFamily: "Ubuntu Mono",
        fontWeight: 800,
        width: '100%',
        height: '100%',
        fontSize: '16px'
    }

    let wallet = useWallet();
    if (!wallet.connected) {
        return (
            <div className="push-greeting">
                <div className="connect-alert">
                    wallet not connected
                </div>
                <div className="connect-button-parent">
                    <WalletMultiButton style={connectStyle}>connect wallet</WalletMultiButton>
                </div>
            </div>
        )
    } else {
        return <div></div>
    }
}

export default ConnectWallet;
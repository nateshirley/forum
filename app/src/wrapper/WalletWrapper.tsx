import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    getPhantomWallet,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import React, { useCallback, useMemo, FC } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import NavigationBar from './NavigationBar';
import Notification from './Notification';
import ComponentSwitch from './ComponentSwitch';
import "../index.css";

const WalletWrapper: FC = () => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets imports all the adapters but supports tree shaking --
    // Only the wallets you want to support will be compiled into your application
    const wallets = useMemo(
        () => [
            getPhantomWallet(),
        ],
        []
    );

    const onError = useCallback(
        (error: WalletError) =>
            toast.custom(
                <Notification
                    message={error.message ? `${error.name}: ${error.message}` : error.name}
                    variant="error"
                />
            ),
        []
    );
    //  "http://127.0.0.1:8899"
    return (
        <ConnectionProvider endpoint="https://lingering-lingering-mountain.solana-devnet.quiknode.pro/fbbd36836095686bd9f580212e675aaab88204c9/">
            <WalletProvider wallets={wallets} onError={onError} autoConnect>
                <WalletModalProvider>
                    <div className="wrapper-parent">
                        <NavigationBar />
                        <ComponentSwitch />
                    </div>
                </WalletModalProvider>
                <Toaster position="bottom-left" reverseOrder={false} />
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletWrapper;
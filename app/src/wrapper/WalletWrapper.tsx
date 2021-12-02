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
import { FORUM_ENDPOINT } from '../utils';

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
            toast('wallet request rejected', {
                icon: '🧨',
            }),
        []
    );
    //  "http://127.0.0.1:8899"
    return (
        <ConnectionProvider endpoint={FORUM_ENDPOINT}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect>
                <WalletModalProvider>
                    <div className="wrapper-parent">
                        <NavigationBar />
                        <ComponentSwitch />
                    </div>
                </WalletModalProvider>
                {/* <Toaster position="bottom-left" reverseOrder={false} /> */}
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletWrapper;
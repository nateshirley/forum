import { Link } from 'react-router-dom';
import { useWallet } from "@solana/wallet-adapter-react";

import "../../Global.css";
import MembershipHeader from './MembershipHeader';
import ConnectWallet from './ConnectWallet';
import ActivePosts from './ActivePosts';
import { useEffect, useState } from 'react';
import { getForumProgram } from '../../api/config';
import { getForumAddress } from '../../api/addresses';
import BN from 'bn.js';

enum AppState {
    Push,
    Transaction,
    SharedPushes,
    Fetching
}

export interface ForumInfo {
    membership: number,
    epoch: number,
    lastReset: BN,
    bump: number
}

function Forum() {
    let wallet = useWallet();
    let program = getForumProgram(wallet);
    let [forumInfo, setForumInfo] = useState<ForumInfo | undefined>(undefined);


    useEffect(() => {
        getForumAddress().then(([forum, bump]) => {
            program.account.forum.fetch(forum).then((fetchedInfo) => {
                console.log("setting forum info")
                setForumInfo({
                    membership: fetchedInfo.membership,
                    epoch: fetchedInfo.epoch,
                    lastReset: fetchedInfo.lastReset,
                    bump: fetchedInfo.bump
                })
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    let header;
    if (!wallet.connected) {
        header = <ConnectWallet />
    } else {
        header = <MembershipHeader />
    }

    return (
        <div className="component-parent">
            {header}
            <ActivePosts forumInfo={forumInfo} />
        </div>
    );
}

export default Forum;
import React, { useCallback, useMemo, FC } from 'react';
import { clusterApiUrl, Connection, ConfirmOptions, Commitment } from '@solana/web3.js';
import { Provider, Wallet } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { Route, Switch } from 'react-router-dom';
import Home from '../components/Home/Forum';
import New from '../components/New'



const ComponentSwitch: FC = () => {


    return (
        <Switch>
            <Route path="/" >
                <Home />
            </Route>
            <Route path="/new">
                <New />
            </Route>
        </Switch>
    );

}

export default ComponentSwitch;
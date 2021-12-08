import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import WalletWrapper from './wrapper/WalletWrapper';
import { EasybaseProvider, useEasybase } from 'easybase-react';
import { useEffect } from 'react';
import ebconfig from './ebconfig';

import 'bootstrap/dist/css/bootstrap.min.css';

require('@solana/wallet-adapter-react-ui/styles.css');
require('./index.css');


ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <EasybaseProvider ebconfig={ebconfig}>
        <div className="wrapper-parent">
          <WalletWrapper />
        </div>
      </EasybaseProvider>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

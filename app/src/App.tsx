import React from 'react';
import './App.scss';

//import { Link, Route, Switch } from "wouter";

import {HashRouter, Link, Routes, Route} from 'react-router-dom';

import { Button, Container } from 'react-bootstrap';

import { ConnectWallet, Web3Provider, useweb3Context, useConnectCalls } from './components/web3';

import { ShowAddress } from './components/utils/display';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons';

import MintView from './components/mint';
import OwnedView from './components/owned';
import ReferralView from './components/referral';
import ClaimsView from './components/claims';



function Bottombar(){

  return <div className='bottomBar d-flex flex-row justify-content-center text-white-50 align-items-center gap-4'>

    <Link to="/" className="link">mint</Link>


  </div>;
}

function Socialbar(){

  return <div className='socialBar d-flex flex-row justify-content-center text-white-50 align-items-center gap-4'>

    <a className="link" target="_blank" rel="noreferrer" href="https://t.me/CZodiacofficial"><FontAwesomeIcon icon={faTelegram} /></a>
    <a className="link" target="_blank" rel="noreferrer" href="https://twitter.com/zodiacs_c"><FontAwesomeIcon icon={faTwitter} /></a>
    <a className="link" target="_blank" rel="noreferrer" href="https://czodiac.gitbook.io/czodiac-litepapper/features-active/rabbit-catch"><FontAwesomeIcon icon={faFileAlt} /></a>


  </div>;
}

function Topbar() {
  const web3Ctx = useweb3Context();
  const { disconnect } = useConnectCalls();

  if (!web3Ctx?.account)
    return null;

  return <div className='topBar d-flex flex-row justify-content-end pe-2 text-white-50 align-items-center'>
    <span className='me-2 chainName'>{web3Ctx.chainInfo.name}:</span>
    <ShowAddress address={web3Ctx.account} />
    <Button className="accountBtn" variant="link" onClick={async () => {
      try {
        await disconnect();
      } catch (error: any) {
        console.error(`failed to disconnect ${error}`);
      }
    }}>
      <FontAwesomeIcon icon={faSignOutAlt} />
    </Button>
  </div>;
}

function MainContent() {
  const web3Ctx = useweb3Context();

  if( (!web3Ctx?.account) || web3Ctx?.reconnecting){
    return <ConnectWallet />;
  }

  return <Routes>
    <Route path="/" element={<Container className='mintView text-center'>
            <MintView/>
            <OwnedView/>
        </Container>}/>

    <Route path="*" element={<div>404 - nothing here</div>}/>

  </Routes>;

}

export default function App() {
  return <Web3Provider><HashRouter>
    <div className='app d-flex flex-column'>

      <Topbar />

      <div className='flex-grow-1 d-flex justify-content-center align-items-center'>
        <MainContent />
      </div>

      <Bottombar/>

      <Socialbar/>

    </div>
    </HashRouter></Web3Provider>;
};

import { useEffect, useState, useMemo } from 'react';
import { useweb3Context } from '../web3';
import { IAsyncResult, ShowError } from '../utils';
import { Spinner, Row, Col } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { CZodiacNFT } from '../../typechain/CZodiacNFT';
import CZodiacNFT_json from '../../typechain/CZodiacNFT.json';

import './owned.scss';

import CardView, { TokenDetails } from './rabbitCard';

import { RabbitCatchMaster } from '../../typechain/RabbitCatchMaster';
import RabbitCatchMaster_json from '../../typechain/RabbitCatchMaster.json';


export default function OwnedView() {

    const [ownedState, setOwnedState] = useState<IAsyncResult<TokenDetails[]>>();

    const { chainInfo, account, web3, mintCount } = useweb3Context() || {};

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

    useEffect(() => {

        (async () => {
            try {
                setOwnedState({ isLoading: true });


                if (!web3 || !chainInfo?.contracts?.rabbitMaster || !account) {
                    console.debug('web3 not yet initialized');
                    return;
                }

                /*
                const rabbitCache: RabbitCatchMaster = new web3.eth.Contract(RabbitCatchMaster_json.abi as any, chainInfo.contracts.rabbitMaster) as any;

                const nftAddress = await rabbitCache.methods.czodiacNFT().call();
                console.log(`nftAddress :${nftAddress}`);

                const rabbitRocket = await rabbitCache.methods.rabbitRocket().call();
                console.log(`rabbitRocket :${rabbitRocket}`);

                const rabbitGreed = await rabbitCache.methods.rabbitGreed().call();
                console.log(`rabbitGreed :${rabbitGreed}`);

                const rabbitCreed = await rabbitCache.methods.rabbitCreed().call();
                console.log(`rabbitCreed :${rabbitCreed}`);

                const rabbitBreed = await rabbitCache.methods.rabbitBreed().call();
                console.log(`rabbitBreed :${rabbitBreed}`);

                const rabbitFancier = await rabbitCache.methods.rabbitFancier().call();
                console.log(`rabbitFancier :${rabbitFancier}`);

                //const nft: CZodiacNFT = new web3.eth.Contract(CZodiacNFT_json.abi as any, nftAddress) as any;
                */

                const nft: CZodiacNFT = new web3.eth.Contract(CZodiacNFT_json.abi as any, chainInfo.contracts.czodiacNFT) as any;

                const balance = Number.parseInt(await nft.methods.balanceOf(account).call());

                console.debug(`balance is ${balance}`);

                const result = (balance ? await Promise.all(Array.from(Array(balance).keys()).map(async i => {
                    const tokenId = await nft.methods.tokenOfOwnerByIndex(account, i).call();
                    const tokenUri = await nft.methods.tokenURI(tokenId).call();

                    return { tokenId, tokenUri };
                })) : []);
                
                
                
                /*.filter(o=>{
                    if(chainInfo?.chainId == '97'){
                        //no filter for testnet
                        return true;
                    }

                    const tokeIdNo = Number.parseInt(o.tokenId);
                    return tokeIdNo>=62 && tokeIdNo <= 2562;
                });*/

                setOwnedState({ result });

            } catch (error: any) {
                setOwnedState({ error });
            }
        })();

    }, [chainInfo, account, web3, mintCount]);


    const chunkedList = useMemo(() => {
        const perChunk = isTabletOrMobile ? 3 : 7;

        const allchunks = (ownedState?.result || []).reduce((all, one, i) => {
            const ch = Math.floor(i / perChunk);
            all[ch] = [...(all[ch] || []), one];
            return all;
        }, [] as ((TokenDetails | undefined)[][]));

        //we want the grid to be even 
        if (allchunks.length > 0) {
            const lastRow = allchunks[allchunks.length - 1];
            for (let i = lastRow.length; i < perChunk; i++) {
                lastRow.push(undefined);
            }
        }


        return allchunks;

    }, [ownedState?.result, isTabletOrMobile]);


    if (!!ownedState?.isLoading) {
        return <Spinner animation="border" variant="primary" />;
    }

    if (!!ownedState?.error) {
        return <ShowError error={ownedState?.error} />
    }

    if (0 === ownedState?.result?.length || 0) {
        return <h3 className='text-warning'>You don't own any</h3>;
    }

    return <div className='owned'>
        <h3>You own</h3>
        {chunkedList.map((list, i) => <Row key={i}>

            {list.map((o, j) => <Col key={j} className="p-1">
                {o && <CardView {...o} />}
            </Col>)}

        </Row>)}
    </div>;



}
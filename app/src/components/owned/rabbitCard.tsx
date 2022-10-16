import { useState, useEffect } from 'react';
import { IAsyncResult, ShowError, fetchJsonAsync } from '../utils';
import { Spinner, Image } from 'react-bootstrap';
import { useweb3Context } from '../web3';

export type TokenDetails = { tokenId: string; tokenUri: string; };

export default function CardView({ tokenUri, tokenId }: TokenDetails) {

    const [cardDetails, setCardDetails] = useState<IAsyncResult<{
        image: string;
        tlUrl: string;
    }>>();

    const { chainInfo } = useweb3Context() || {};



    useEffect(() => {

        (async () => {
            try {
                setCardDetails({ isLoading: true });

                if (!chainInfo?.contracts?.czodiacNFT) {
                    console.debug('web3 not yet initialized');
                    return;
                }


                //"ipfs://QmZmF4aTdKtRzFj5pZu9MvAspDic9Z6T11ymofnAiV7Gsv/1.json"
                //https://czodiac.mypinata.cloud/ipfs/QmZmF4aTdKtRzFj5pZu9MvAspDic9Z6T11ymofnAiV7Gsv/1.json
                const jsonUri = tokenUri.replace('ipfs://', 'https://czodiac.mypinata.cloud/ipfs/');

                //this fetch sometime fails so we do a progresive delay in loading this
                for (let i = 0; true; i++) {

                    try {

                        if(i>0){
                            const timeout = 5 * i;
                            console.debug(`nftfetch: try ${i} -> ${timeout} seconds`);
                            await new Promise(r=>setTimeout(r,timeout*1000));
                        }

                        /*
                        if(i<4){
                            throw new Error(`emulate failure`)
                        }
                        */

                        const { image, name } = await fetchJsonAsync<{
                            name: string;
                            image: string;
                        }>(fetch(jsonUri));

                        

                        if (!image) {
                            throw new Error('failed to load NFT details');
                        }
                        const tlUrl = `https://www.treasureland.market/detail?chain_id=${chainInfo.chainId}&contract=${chainInfo.contracts.czodiacNFT}&order_id=&token_id=${tokenId}`
                        setCardDetails({ result: { tlUrl, image: image.replace('ipfs://', 'https://czodiac.mypinata.cloud/ipfs/') } });
        
                        break;

                    } catch (error: any) {

                        if(10==i){
                            throw error;
                        }else{
                            console.warn(`nftfetch: failed to fetch image will try again ${i} : ${error}`)
                        }

                    }

                }



            } catch (error: any) {
                setCardDetails({ error });
            }

        })();

    }, [tokenUri, chainInfo]);

    return <div className="rCard text-center mb-3">

        {!!cardDetails?.isLoading && <Spinner animation='border' variant='primary' />}

        {!!cardDetails?.error && <ShowError error={cardDetails.error} />}

        {cardDetails?.result?.image && (<>
            <a href={cardDetails?.result?.image || '#'} target='_blank'>
                <Image src={cardDetails?.result?.image} fluid />
            </a>

            <a href={cardDetails?.result?.tlUrl || '#'} target='_blank'>
                <div className="test-success">View on TL</div>
            </a>
        </>)}

    </div>;
}
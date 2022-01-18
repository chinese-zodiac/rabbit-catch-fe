import { useState, useEffect } from 'react';
import { IAsyncResult, ShowError, fetchJsonAsync } from '../utils';
import { Spinner, Image } from 'react-bootstrap';
import { useweb3Context } from '../web3';

export type TokenDetails = { tokenId: string; tokenUri: string; };

export default function CardView({ tokenUri, tokenId }: TokenDetails) {

    const [cardDetails, setCardDetails] = useState<IAsyncResult<{
        image: string;
        tlUrl:string;
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

                const { image, name } = await fetchJsonAsync<{
                    name: string;
                    image: string;
                }>(fetch(jsonUri));

                if (!image) {
                    throw new Error('failed to load NFT details');
                }

                const tlUrl = `https://treasureland.market/assets/${chainInfo.contracts.czodiacNFT}/${tokenId}?chain_id=${chainInfo.chainId}`;

                setCardDetails({ result: { tlUrl, image: image.replace('ipfs://', 'https://czodiac.mypinata.cloud/ipfs/') } });



            } catch (error: any) {
                setCardDetails({ error });
            }

        })();

    }, [tokenUri,chainInfo]);

    return <div className="rCard text-center mb-3">

        {!!cardDetails?.isLoading && <Spinner animation='border' variant='primary' />}

        {!!cardDetails?.error && <ShowError error={cardDetails.error} />}

        {cardDetails?.result?.image && <div>
            <Image src={cardDetails?.result?.image} fluid />
            <a href={cardDetails?.result?.tlUrl||'#'} target='_blank' className="link-success">View on TL</a>
        </div>
        }

    </div>;
}
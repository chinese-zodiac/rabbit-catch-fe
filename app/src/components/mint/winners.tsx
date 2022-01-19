import { useEffect, useState } from 'react';
import { useweb3Context } from '../web3';
import { IAsyncResult, ShowError } from '../utils';
import { Spinner } from 'react-bootstrap';

import { RabbitGreed } from '../../typechain/RabbitGreed';
import RabbitGreed_json from '../../typechain/RabbitGreed.json';

import { RabbitRocket } from '../../typechain/RabbitRocket';
import RabbitRocket_json from '../../typechain/RabbitRocket.json';

import { ShowAddress } from '../utils/display';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate, faCrown } from '@fortawesome/free-solid-svg-icons';



export default function WinnersView() {

    const [winners, setWinners] = useState<IAsyncResult<{
        address: string;
        color: string;
        buys:string;
    }[]>>();

    const [lastMinter, setLastMinter] = useState<IAsyncResult<string>>();

    const { chainInfo, account, web3 } = useweb3Context() || {};

    useEffect(() => {

        (async () => {
            try {
                setWinners({ isLoading: true });
                setLastMinter({ isLoading: true});


                if (!web3 || !chainInfo?.contracts?.rabbitGreed || !account) {
                    throw new Error('web3 not yet initialized');

                }

                const rabbitGreed: RabbitGreed = new web3.eth.Contract(RabbitGreed_json.abi as any, chainInfo.contracts.rabbitGreed) as any;
                const rabbitRocket: RabbitRocket = new web3.eth.Contract(RabbitRocket_json.abi as any, chainInfo.contracts.rabbitRocket) as any;

                const first = await rabbitGreed.methods.first().call();
                const second = await rabbitGreed.methods.second().call();
                const third = await rabbitGreed.methods.third().call();

                const lastBuyer = await rabbitRocket.methods.lastBuyer().call(); 

                const positions = [
                    { address: first, color: '#FFD700' },
                    { address: second, color: '#C0C0C0' },
                    { address: third, color: '#CD7F32' }
                ];

                const result = await Promise.all(positions.map(async p=>{
                    const buys = await rabbitGreed.methods.totalBuys(p.address).call();
                    return ({...p,buys});
                }));

                setWinners({ result });
                setLastMinter({result:lastBuyer});

                console.log(`first ${first}, account: ${account}`);


            } catch (error: any) {
                setWinners({ error });
            }
        })();

    }, [chainInfo, account, web3]);


    return <div className='winnersView text-center'>

        <h6>Rabbit Greed (most mints)</h6>
        {!!winners?.isLoading && <Spinner animation="border" variant="info" />}

        {!!winners?.error && <ShowError error={winners?.error} />}

        <div className='mintedlabel me-2'>minted</div>
        
        {(winners?.result || []).map((s, i) => <div key={i} className='winnerItem d-flex align-items-center justify-content-center gap-3 mb-2'>
            <div className="certHolder">
                <FontAwesomeIcon className="certback" icon={faCertificate} style={{ color: s.color }} />
                <span className="score">{i + 1}</span>

                {s.address.toUpperCase() == account?.toUpperCase() && <FontAwesomeIcon className='owned' icon={faCrown}/>}

            </div>
            <ShowAddress address={s.address} />
            <span className='ms-1'>{s.buys}</span>
        </div>
        )}

        
        <h6>Rabbit Rocket (latest mint)</h6>
        {!!lastMinter?.isLoading && <Spinner animation="border" variant="info" />}

        {!!lastMinter?.error && <ShowError error={lastMinter?.error} />}
        
        {lastMinter?.result && (<div className='winnerItem d-flex align-items-center justify-content-center gap-3 mb-2'>
            <div className="certHolder">
                <FontAwesomeIcon className="certback" icon={faCertificate} style={{ color: '#FFD700' }} />
                <span className="score">1</span>

                {lastMinter.result.toUpperCase() == account?.toUpperCase() && <FontAwesomeIcon className='owned' icon={faCrown}/>}

            </div>
            <ShowAddress address={lastMinter.result} />
        </div>
        )}
    </div>;


}
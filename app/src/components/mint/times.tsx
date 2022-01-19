import { useEffect, useState } from 'react';
import { useweb3Context } from '../web3';
import { IAsyncResult, ShowError } from '../utils';
import { Spinner } from 'react-bootstrap';

import { RabbitRocket } from '../../typechain/RabbitRocket';
import RabbitRocket_json from '../../typechain/RabbitRocket.json';

import moment from 'moment';
import 'moment-duration-format';


export default function TimesView() {

    const [allTimes, setAllTimes] = useState<IAsyncResult<(string | undefined)[]>>();

    const { chainInfo, account, web3 } = useweb3Context() || {};

    useEffect(() => {

        (async () => {
            try {
                setAllTimes({ isLoading: true });


                if (!web3 || !chainInfo?.contracts?.rabbitRocket || !account) {
                    throw new Error('web3 not yet initialized');

                }

                const rabbitRocket: RabbitRocket = new web3.eth.Contract(RabbitRocket_json.abi as any, chainInfo.contracts.rabbitRocket) as any;

                const startEpoch = await rabbitRocket.methods.startEpoch().call();
                const whitelistEndEpoch = await rabbitRocket.methods.whitelistEndEpoch().call();
                const endEpoch = await rabbitRocket.methods.endEpoch().call();

                const result = [
                    { prompt: 'Game starts (max 5, whitelist only)', epoch: startEpoch },
                    { prompt: 'Public minting (no limits)', epoch: whitelistEndEpoch },
                    { prompt: 'Might end', epoch: endEpoch }
                ].map(c => {
                    const t = moment.unix(Number.parseInt(c.epoch));
                    const now = moment();
                    if (t.isBefore(now)) {
                        console.debug(`${c.prompt} is in the past`);
                        return undefined;
                    }

                    //return `${c.prompt} ${t.fromNow()}`;

                    const duration =  moment.duration( t.diff(now));

                    return `${c.prompt} in ${duration.format('D [days], h [hours]')}`;
                }).filter(s=>!!s);


                setAllTimes({ result });


            } catch (error: any) {
                setAllTimes({ error });
            }
        })();

    }, [chainInfo, account, web3]);


    return <div className='timesView'>
        {!!allTimes?.isLoading && <Spinner animation="border" variant="info" />}

        {!!allTimes?.error && <ShowError error={allTimes?.error} />}

        {(allTimes?.result||[]).map( (s,i)=><div key={i}>
            {s}
        </div>
        )}
    </div>;


}
import { useState, useEffect, useMemo } from "react";
import { Button, Spinner, Row, Col, Container } from "react-bootstrap";
import { useweb3Context } from '../web3';
import { IAsyncResult, ShowError } from '../utils';

import { RabbitBreed } from '../../typechain/RabbitBreed';
import RabbitBreed_json from '../../typechain/RabbitBreed.json';
import { RabbitFancier } from '../../typechain/RabbitFancier';
import RabbitFancier_json from '../../typechain/RabbitFancier.json';
import { RabbitGreed } from '../../typechain/RabbitGreed';
import RabbitGreed_json from '../../typechain/RabbitGreed.json';

import { RabbitRocket } from '../../typechain/RabbitRocket';
import RabbitRocket_json from '../../typechain/RabbitRocket.json';

import './claims.scss';

export default function ClaimsView() {

    const [withdrawing, setWithdrawing] = useState<IAsyncResult<string> & { index: number }>();
    const { chainInfo, account, web3 } = useweb3Context() || {};

    const [rewards, setRewards] = useState<IAsyncResult<{
        reward: string; name: string; desc: string;
        withdraw: () => Promise<string>;
    }[]>>();

    async function loadExisting() {
        try {
            setRewards({ isLoading: true });

            if (!web3 || !chainInfo?.contracts?.rabbitCreed || !account) {
                throw new Error('web3 not yet initialized');

            }


            const breed = async () => {
                const rContract: RabbitBreed = new web3.eth.Contract(RabbitBreed_json.abi as any, chainInfo.contracts.rabbitBreed) as any;
                return ({
                    name: 'Rabbit Breed',
                    desc: '10% (312) to best collection (most variety of traits in one wallet): 5% (156 BNB) to first, 2.5% (78 BNB) each to second and third',
                    paymentsWei: await rContract.methods.payments(account).call(),
                    withdraw: async () => (await rContract.methods.withdrawPayments(account).send({
                        from: account,
                        to: chainInfo.contracts.rabbitCreed
                    })).transactionHash
                });
            }

            const fancier = async () => {
                const rContract: RabbitFancier = new web3.eth.Contract(RabbitFancier_json.abi as any, chainInfo.contracts.rabbitFancier) as any;
                return ({
                    name: 'Rabbit Fancier',
                    desc: '10% (312) to rarest holders (Rabbit with rare traits): 5% (156 BNB) to first, 2.5% (78 BNB) each to second and third',
                    paymentsWei: await rContract.methods.payments(account).call(),
                    withdraw: async () => (await rContract.methods.withdrawPayments(account).send({
                        from: account,
                        to: chainInfo.contracts.rabbitCreed
                    })).transactionHash
                });
            }

            const greed = async () => {
                const rContract: RabbitGreed = new web3.eth.Contract(RabbitGreed_json.abi as any, chainInfo.contracts.rabbitGreed) as any;
                return ({
                    name: 'Rabbit Greed',
                    desc: '10% (312) to biggest buyer: 5% (156 BNB) to first, 2.5% (78 BNB) each to second and third',
                    paymentsWei: await rContract.methods.payments(account).call(),
                    withdraw: async () => (await rContract.methods.withdrawPayments(account).send({
                        from: account,
                        to: chainInfo.contracts.rabbitCreed
                    })).transactionHash
                });
            }

            const rocket = async () => {
                const rContract: RabbitRocket = new web3.eth.Contract(RabbitRocket_json.abi as any, chainInfo.contracts.rabbitRocket) as any;
                return ({
                    name: 'Rabbit Rocket',
                    desc: '10% (312) to last buyer (if sale ends early, otherwise to CZodiac treasury): 10% (312 bnb)',
                    paymentsWei: await rContract.methods.payments(account).call(),
                    withdraw: async () => (await rContract.methods.withdrawPayments(account).send({
                        from: account,
                        to: chainInfo.contracts.rabbitCreed
                    })).transactionHash
                });
            }

            const result = (await Promise.all([breed, fancier, greed, rocket].map(f => f())))
                .map(f => ({ ...f, reward: web3.utils.fromWei(f.paymentsWei, "ether") }));

            //                    payments: web3.utils.fromWei(paymentsWei, "ether"),

            setRewards({ result });


        } catch (error: any) {
            setRewards({ error });
        }
    }

    useEffect(() => {

        loadExisting();

    }, [chainInfo, account, web3]);

    return <Container className="claims text-center">
        <h2>Claims</h2>

        {!!rewards?.isLoading && <Spinner animation='border' variant='primary' />}

        {!!rewards?.error && <ShowError error={rewards.error} />}

        <Row>

            {(rewards?.result || []).map((r, index) => <Col lg key={index} className="text-center p-1">
                <div className="reward p-2">
                <h6>{r.name}</h6>
                <p className="desc"><small className="text-info">{r.desc}</small></p>

                <div className="my-4">


                    <span>Your earned rewards is <strong>{r.reward || '...'}</strong> BNB </span>
                    <Button className="mx-2 mt-1" variant="success" size="sm" 
                        disabled={!r.reward || r.reward === '0' || !!withdrawing?.isLoading} 
                        onClick={async () => {

                        try {

                            if (!web3 || !chainInfo?.contracts?.rabbitCreed || !account) {
                                throw new Error('web3 not yet initialized');
                            }

                            
                            if (!r.reward || r.reward === '0') {
                                throw new Error('no payment to withdraw');
                            }
                            

                            setWithdrawing({ index, isLoading: true });

                            const result = await r.withdraw();

                            setWithdrawing({ index, result });

                            await loadExisting();

                        } catch (error: any) {
                            setWithdrawing({ index, error });
                        }

                    }} >
                        Claim reward
                    </Button>

                    {index === withdrawing?.index && !!withdrawing?.isLoading && <div className='text-center'>
                        <Spinner animation='border' variant='info' />
                        <span className='text-success ms-1' >Waiting for wallet</span>

                    </div>}


                    {index === withdrawing?.index &&  !!withdrawing?.error && <ShowError error={withdrawing.error} />}

                    {index === withdrawing?.index && !!withdrawing?.result && <div className="my-1 text-info"><small>Reward claimed with tx :{withdrawing?.result}</small> </div>}



                </div>
                </div>

            </Col>
            )}

        </Row>
    </Container>;
}
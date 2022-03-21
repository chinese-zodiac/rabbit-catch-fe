/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

export interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type OwnershipTransferred = ContractEventLog<{
  previousOwner: string;
  newOwner: string;
  0: string;
  1: string;
}>;

export interface RabbitMinterV2 extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): RabbitMinterV2;
  clone(): RabbitMinterV2;
  methods: {
    baseURI(): NonPayableTransactionObject<string>;

    canMint(): NonPayableTransactionObject<boolean>;

    czodiacNFT(): NonPayableTransactionObject<string>;

    getPrice(): NonPayableTransactionObject<string>;

    mint(_for: string): PayableTransactionObject<void>;

    mintCount(): NonPayableTransactionObject<string>;

    mintCountMax(): NonPayableTransactionObject<string>;

    mintCountPriceIncrement(): NonPayableTransactionObject<string>;

    owner(): NonPayableTransactionObject<string>;

    priceIncrement(): NonPayableTransactionObject<string>;

    priceStart(): NonPayableTransactionObject<string>;

    renounceOwnership(): NonPayableTransactionObject<void>;

    setPriceIncrement(
      _to: number | string | BN
    ): NonPayableTransactionObject<void>;

    setPriceStart(_to: number | string | BN): NonPayableTransactionObject<void>;

    transferOwnership(newOwner: string): NonPayableTransactionObject<void>;
  };
  events: {
    OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter;
    OwnershipTransferred(
      options?: EventOptions,
      cb?: Callback<OwnershipTransferred>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "OwnershipTransferred", cb: Callback<OwnershipTransferred>): void;
  once(
    event: "OwnershipTransferred",
    options: EventOptions,
    cb: Callback<OwnershipTransferred>
  ): void;
}

import { common, ECPoint, UInt160, UInt256, VMState } from '@neo-one/client-common';
import { Monitor } from '@neo-one/monitor';
import BN from 'bn.js';
import { Action } from './action';
import { Block } from './Block';
import { WriteBlockchain } from './Blockchain';
import { ContractParameter } from './contractParameter';
import { ScriptContainer } from './ScriptContainer';
import { Witness } from './Witness';

export interface VerifyScriptOptions {
  readonly scriptContainer: ScriptContainer;
  readonly hash: UInt160;
  readonly witness: Witness;
}

export interface VerifyScriptResult {
  readonly failureMessage?: string;
  readonly hash: UInt160;
  readonly witness: Witness;
  readonly actions: ReadonlyArray<Action>;
}

export type VerifyScript = (options: VerifyScriptOptions) => Promise<VerifyScriptResult>;

export enum TriggerType {
  Verification = 0x00,
  Application = 0x10,
}

// Application

export interface Script {
  readonly code: Buffer;
}

export const NULL_ACTION = {
  blockIndex: -1,
  blockHash: common.ZERO_UINT256,
  transactionIndex: -1,
  transactionHash: common.ZERO_UINT256,
};

export interface ExecutionAction {
  readonly blockIndex: number;
  readonly blockHash: UInt256;
  readonly transactionIndex: number;
  readonly transactionHash: UInt256;
}

export interface ExecuteScriptsResult {
  readonly state: VMState;
  readonly stack: ReadonlyArray<ContractParameter>;
  readonly stackAlt: ReadonlyArray<ContractParameter>;
  readonly gasConsumed: BN;
  readonly gasCost: BN;
  readonly errorMessage?: string;
}

export interface VMListeners {
  readonly onNotify?: (options: {
    readonly args: ReadonlyArray<ContractParameter>;
    readonly scriptHash: UInt160;
  }) => void;

  readonly onLog?: (options: { readonly message: string; readonly scriptHash: UInt160 }) => void;
  readonly onMigrateContract?: (options: { readonly from: UInt160; readonly to: UInt160 }) => void;
  readonly onSetVotes?: (options: { readonly address: UInt160; readonly votes: ReadonlyArray<ECPoint> }) => void;
}

export interface VMFeatureSwitches {
  readonly structClone: boolean;
}

export type ExecuteScripts = (input: {
  readonly monitor: Monitor;
  readonly scripts: ReadonlyArray<Script>;
  readonly blockchain: WriteBlockchain;
  readonly scriptContainer: ScriptContainer;
  readonly triggerType: TriggerType;
  readonly action: ExecutionAction;
  readonly gas: BN;
  readonly listeners?: VMListeners;
  readonly skipWitnessVerify?: boolean;
  readonly persistingBlock?: Block;
  readonly vmFeatures: VMFeatureSwitches;
}) => Promise<ExecuteScriptsResult>;

export interface VM {
  readonly executeScripts: ExecuteScripts;
}

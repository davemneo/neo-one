import { Address, Fixed, SmartContract } from '@neo-one/smart-contract';
import { Crowdsale, Pausable } from '@neo-one/smart-contract-lib';

export function PausableCrowdsale<TBase extends Constructor<SmartContract>>(Base: TBase) {
  abstract class PausableCrowdsaleClass extends Crowdsale(Pausable<Constructor<SmartContract>>(Base)) {
    public _preValidatePurchase(beneficiary: Address, NEOAmount: Fixed<8>) {
      if (!this.isPaused()) {
        return super._preValidatePurchase(beneficiary, NEOAmount);
      }
    }
  }

  return PausableCrowdsaleClass;
}

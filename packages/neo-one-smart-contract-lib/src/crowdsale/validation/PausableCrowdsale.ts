import { Address, Fixed, SmartContract } from '@neo-one/smart-contract';
import { Crowdsale } from '@neo-one/smart-contract-lib';
import { Pausable } from '../../lifecycle/Pausable';
/**
 * @title IncreasingPriceCrowdsale
 * @dev Extension of Crowdsale contract that allows for pausing.
 */
function PausableCrowdsale<TBase extends Constructor<SmartContract>>(Base: TBase) {
  abstract class PausableCrowdsaleClass extends Pausable<Constructor<SmartContract>>(Crowdsale<Constructor<SmartContract>>(Base)) {
    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met.
     * Use super to concatenate validations.
     * Adds the validation that the crowdsale must not be paused.
     * @param beneficiary Address performing the token purchase
     * @param NEOAmount Value in wei involved in the purchase
     */
    public _preValidatePurchase(beneficiary: Address,  NEOAmount: Fixed<8>) {
      if(this.isOpen() && !this.isPaused()) {
        return super._preValidatePurchase(beneficiary, NEOAmount);
      }
    }
}

  return PausableCrowdsaleClass;


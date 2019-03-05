import { SmartContract, Fixed, Address } from '@neo-one/smart-contract';
import { Crowdsale } from '../Crowdsale';
import { WhitelistRole } from '../../access';

/**
 * @title WhitelistCrowdsale
 * @dev Crowdsale in which only whitelisted users can contribute.
 */
export function WhitelistCrowdsale<TBase extends Constructor<SmartContract>>(Base: TBase) {
  abstract class WhitelistedCrowdsaleClass extends Crowdsale<Constructor<SmartContract>>(
    WhitelistRole<Constructor<SmartContract>>(Base),
  ) {
    /**
     * @dev Extend parent behavior requiring beneficiary to be whitelisted. Note that no
     * restriction is imposed on the account sending the transaction.
     * @param _beneficiary Token beneficiary
     * @param _weiAmount Amount of wei contributed
     */
    protected _preValidatePurchase(purchaser: Address, beneficiary: Address, NEOAmount: Fixed<8>): boolean {
      if (!this.isWhitelisted(beneficiary)) {
        throw new Error(' Rollback: invalid participant');
      }
      super._preValidatePurchase(purchaser, beneficiary, NEOAmount);

      return true;
    }
  }
  return WhitelistedCrowdsaleClass;
}

import { SmartContract, Fixed, Address } from '@neo-one/smart-contract';
import { Crowdsale } from './Crowdsale';
import { WhitelistRole } from './WhitelistRole';

export function WhitelistCrowdsale<TBase extends Constructor<SmartContract>>(Base: TBase) {
  abstract class WhitelistedCrowdsaleClass extends WhitelistRole(Crowdsale<Constructor<SmartContract>>(Base)) {
    protected _preValidatePurchase(purchaser: Address, beneficiary: Address, NEOAmount: Fixed<8>): boolean {
      ///   A WHITE LIST FUNCTION
      if (!this.isWhitelisted(beneficiary)) {
        throw new Error(' Rollback: invalid participant');
      }

      ///   A CROWDSALE FUNCTION
      super._preValidatePurchase(purchaser, beneficiary, NEOAmount);

      return true;
    }
  }
  return WhitelistedCrowdsaleClass;
}

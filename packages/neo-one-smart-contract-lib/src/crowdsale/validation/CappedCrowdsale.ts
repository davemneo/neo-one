
import { Address, constant, createEventNotifier, SmartContract, Fixed } from '@neo-one/smart-contract';
import { Crowdsale } from '../';

/**
 * @title CappedCrowdsale
 * @dev Crowdsale with a limit for total contributions.
 */


function CappedCrowdsale<TBase extends Constructor<SmartContract>>(Base: TBase) {
  abstract class CappedCrowdsaleClass extends Crowdsale<Constructor<SmartContract>>(Base) {
    // assign a value when you extend this class
    abstract protected _cap: Fixed<0>  = 0;


    public get capRemaining(): Fixed<0> {
      return this._cap - this.neoRaised();
    }

    /**
     * @return the cap of the crowdsale.
     */
    public get cap() {
      return this._cap;
    }
  }

  function capReached():boolean {
    return weiRaised() >= this._cap;
  }

  return CappedCrowdsaleClass;
}


    /**
     * @dev Checks whether the cap has been reached.
     * @return Whether the cap was reached
     */

    /**
     * @dev Extend parent behavior requiring purchase to respect the funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(weiRaised().add(weiAmount) <= this._cap);
    }
}

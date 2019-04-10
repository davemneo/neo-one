import { Address, constant, createEventNotifier, Fixed, SmartContract } from '@neo-one/smart-contract';
import { Ownable } from '../ownership/Ownable';

const notifyTokensPurchased = createEventNotifier<Address, Address, Fixed<8>, Fixed<8>>(
  'tokens_purchased',
  'purchaser',
  'beneficiary',
  'NEO',
  'qty tokens',
);

export function CrowdsaleContract() {
  abstract class CrowdsaleContractClass extends Ownable(SmartContract) {
    public readonly token: Address = this.initialCrowdsaleToken();
    public readonly rate: Fixed<8> = this.initialCrowdsaleRate();
    public readonly wallet: Address = this.initialCrowdsaleWallet();
    protected mutableNeoRaised: Fixed<8> = 0;
    protected mutableTotalSupply: Fixed<8> = 0;

    @constant
    public get neoRaised(): Fixed<8> {
      return this.mutableNeoRaised;
    }

    @constant
    public get totalSupply(): Fixed<8> {
      return this.mutableTotalSupply;
    }

    public mintTokens(purchaser: Address, beneficiary: Address, amount: Fixed<8>): boolean {
      this.preValidatePurchase(purchaser, beneficiary, amount);
      const tokens = this.getTokenAmount(amount);
      this.mutableNeoRaised += amount;
      this.processPurchase(purchaser, beneficiary, tokens);
      notifyTokensPurchased(purchaser, beneficiary, amount, tokens);
      this.updatePurchasingState(purchaser, beneficiary, amount);
      this.forwardFunds(amount, beneficiary);
      this.postValidatePurchase(purchaser, beneficiary, amount);

      return true;
    }

    // Override these functions with your configuration.
    protected abstract initialCrowdsaleWallet(): Address;
    protected abstract initialCrowdsaleRate(): Fixed<8>;
    protected abstract initialCrowdsaleToken(): Address;

    // PITFALL: Remember, when layering functionality in different classes, remember to
    // call the corresponding super._fnx() to ensure the chain of checks is maintained.

    /* tslint:disable: no-unused no-empty */
    protected preValidatePurchase(purchaser: Address, beneficiary: Address, amount: Fixed<8>) {
      // override with any pre-purchase checks
    }

    protected processPurchase(purchaser: Address, beneficiary: Address, tokens: Fixed<8>) {
      // override with any purchase-process
    }

    protected updatePurchasingState(purchaser: Address, beneficiary: Address, amount: Fixed<8>) {
      // override with any state updates required
    }

    protected forwardFunds(amount: Fixed<8>, account: Address) {
      // override with your method of forwarding funds
    }

    protected postValidatePurchase(purchaser: Address, beneficiary: Address, amount: Fixed<8>) {
      // override with any post purchase validation checks
    }

    protected getTokenAmount(amount: Fixed<8>) {
      return amount * this.rate;
    }
  }

  return CrowdsaleContractClass;
}

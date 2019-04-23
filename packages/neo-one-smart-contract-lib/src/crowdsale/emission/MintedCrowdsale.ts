import { Address, constant, createEventNotifier, Fixed, SmartContract } from '@neo-one/smart-contract';
import { CrowdsaleContract } from '../CrowdsaleContract';
import { NEP5Token } from '../../NEP5Token';

const notifyTokensPurchased = createEventNotifier<Address, Address, Fixed<8>, Fixed<8>>(
  'tokens_purchased',
  'purchaser',
  'beneficiary',
  'NEO',
  'qty tokens',
);
interface TNEP5Token {
  readonly issue: (addr: Address, amount: Fixed<8>) => void;
}
abstract class MintedCrowdsale extends CrowdsaleContract() {
  protected _deliverTokens(beneficiary: Address, tokenAmount: Fixed<8>) {
    const smartContract = SmartContract.for<TNEP5Token>(this.token);
    smartContract.issue(beneficiary, tokenAmount);
  }
}

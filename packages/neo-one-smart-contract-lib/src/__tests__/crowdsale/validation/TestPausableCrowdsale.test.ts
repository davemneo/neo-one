import { Address, SmartContract, constant } from '@neo-one/smart-contract';
/* tslint:disable-next-line: no-implicit-dependencies */
import { PausableCrowdsale } from '@neo-one/smart-contract-lib';

export class TestPausableCrowdsale extends PausableCrowdsale(SmartContract) {
  public constructor(owner: Address) {
    super();
    if (!Address.isCaller(owner)) {
      throw new Error('Sender was not the owner.');
    }

    this.firstPauser(owner);
  }

  @constant
  public doPauseOnlyActivity(): boolean {
    if (this.whenPaused()) {
      return true;
    }

    return false;
  }

  @constant
  public doUnpausedOnlyActivity(): boolean {
    if (this.whenNotPaused()) {
      return true;
    }

    return false;
  }
}

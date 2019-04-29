import { Deploy } from '@neo-one/smart-contract';
/*tslint:disable-next-line:no-implicit-dependencies*/
import { SecondaryNEP5Token } from '@neo-one/smart-contract-lib';

export class TestSecondaryNEP5Token extends SecondaryNEP5Token {
  public readonly name = 'string';
  public readonly decimals = 8;
  public readonly symbol = 'string';
  public constructor(protected readonly initialPrimary = Deploy.senderAddress) {
    super();
  }
}

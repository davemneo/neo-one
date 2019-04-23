import { Address, Deploy, Fixed } from '@neo-one/smart-contract';
// tslint:disable-next-line:no-implicit-dependencies
import { CrowdsaleWithMinterRole } from '@neo-one/smart-contract-lib';

export class TestCrowdsaleWithMinterRole extends CrowdsaleWithMinterRole {
  public constructor(protected initialOwner: Address = Deploy.senderAddress) {
    super();
    this.initialMinter(initialOwner);
  }
  protected initialCrowdsaleWallet(): Address {
    return Address.from('ALq7AWrhAueN6mJNqk6FHJjnsEoPRytLdW');
  }

  protected initialCrowdsaleRate(): Fixed<8> {
    return 1_20000000;
  }
  protected initialCrowdsaleToken(): Address {
    return Address.from('ALq7AWrhAueN6mJNqk6FHJjnsEoPRytLdW');
  }
}

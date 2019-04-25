import { common, crypto } from '@neo-one/client-common';
import { SmartContractAny } from '@neo-one/client-core';
import { withContracts } from '@neo-one/smart-contract-test';
import * as path from 'path';

const RECIPIENT = {
  PRIVATE_KEY: '7d128a6d096f0c14c3a25a2b0c41cf79661bfcb4a8cc95aaaea28bde4d732344',
  PUBLIC_KEY: '02028a99826edc0c97d18e22b6932373d908d323aa7f92656a77ec26e8861699ef',
};

describe('Crowdsale', () => {
  test('deploy + transfer', async () => {
    await withContracts<{ testCrowdsaleContract: SmartContractAny }>(
      [
        {
          filePath: path.resolve(
            __dirname,
            '..',
            '..',
            '__data__',
            'contracts',
            'crowdsale',
            'TestCrowdsaleContract.ts',
          ),
          name: 'TestCrowdsaleContract',
        },
      ],
      async ({ testCrowdsaleContract: smartContract, masterAccountID }) => {
        crypto.addPublicKey(
          common.stringToPrivateKey(RECIPIENT.PRIVATE_KEY),
          common.stringToECPoint(RECIPIENT.PUBLIC_KEY),
        );

        const deployResult = await smartContract.deploy(masterAccountID.address, { from: masterAccountID });

        const deployReceipt = await deployResult.confirmed({ timeoutMS: 2500 });
        if (deployReceipt.result.state !== 'HALT') {
          throw new Error(deployReceipt.result.message);
        }

        expect(deployReceipt.result.gasConsumed.toString()).toMatchSnapshot('deploy consumed');
        expect(deployReceipt.result.gasCost.toString()).toMatchSnapshot('deploy cost');
        expect(deployReceipt.result.value).toBeTruthy();

        const [initialOwner, initialRate, token, initialTotalSupply, wallet] = await Promise.all([
          smartContract.owner.confirmed(),
          smartContract.rate(),
          smartContract.token(),
          smartContract.totalSupply(),
          smartContract.wallet(),
        ]);

        expect(initialOwner.result.value).toEqual(masterAccountID.address);
        expect(initialRate.toNumber()).toEqual(1.2);
        expect(wallet.toString()).toEqual('ALq7AWrhAueN6mJNqk6FHJjnsEoPRytLdW');
        expect(token.toString()).toEqual('ALq7AWrhAueN6mJNqk6FHJjnsEoPRytLdW');

        expect(initialTotalSupply.toString()).toEqual('0');
      },
      { deploy: false },
    );
  });
});

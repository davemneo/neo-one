import { common, crypto } from '@neo-one/client-common';
import { SmartContractAny } from '@neo-one/client-core';
import { withContracts } from '@neo-one/smart-contract-test';
import * as path from 'path';

const RECIPIENT = {
  PRIVATE_KEY: '7d128a6d096f0c14c3a25a2b0c41cf79661bfcb4a8cc95aaaea28bde4d732344',
  PUBLIC_KEY: '02028a99826edc0c97d18e22b6932373d908d323aa7f92656a77ec26e8861699ef',
};

export const newAddress = () => {
  const address2 = crypto.createKeyPair();
  crypto.addPublicKey(address2.privateKey, address2.publicKey);
  return address2;
};

const addreses = [newAddress(), newAddress()];
addreses.forEach((address) => {
  crypto.addPublicKey(address.privateKey, address.publicKey);
});

describe('Crowdsale', () => {
  test('deploy + transfer', async () => {
    await withContracts<{ testCrowdsaleWithMinterRole: SmartContractAny }>(
      [
        {
          filePath: path.resolve(
            __dirname,
            '..',
            '..',
            '..',
            '__data__',
            'contracts',
            'crowdsale',
            'emission',
            'TestCrowdsaleWithMinterRole.ts',
          ),
          name: 'TestCrowdsaleWithMinterRole',
        },
      ],
      async ({ client, networkName, testCrowdsaleWithMinterRole: smartContract, masterAccountID, accountIDs }) => {
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

        const [ownerIsMinter, altAddrIsMinter, initialRate, token, initialTotalSupply, wallet] = await Promise.all([
          smartContract.isMinter(masterAccountID.address),
          smartContract.isMinter(accountIDs[2].address),
        ]);

        expect(ownerIsMinter).toBe(true);
        expect(altAddrIsMinter).toBe(false);

        const addMinterRequest = await smartContract.addMinter.confirmed(
          accountIDs[2].address,
          masterAccountID.address,
          { from: masterAccountID },
        );

        expect(addMinterRequest.result.state).toBe('HALT');

        const altAddrIsMinterB = await smartContract.isMinter(accountIDs[2].address);
        expect(altAddrIsMinterB).toBe(true);

        const removeMinterRequest = await smartContract.removeMinter.confirmed(
          masterAccountID.address,
          accountIDs[3].address,
          { from: accountIDs[2] },
        );
        expect(removeMinterRequest.result.state).toBe('HALT');
        expect(removeMinterRequest.result.value).toBe(true);
        const ownerAddrIsMinterB = await smartContract.isMinter(masterAccountID.address);
        expect(ownerAddrIsMinterB).toBe(false);
      },
      { deploy: false },
    );
  });
});

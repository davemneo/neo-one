import { InvokeReceipt, TransactionResult } from '@neo-one/client-common';
import BigNumber from 'bignumber.js';
import { withContracts } from '@neo-one/smart-contract-test';
import * as path from 'path';
import { testToken } from '../__data__';

describe('TestToken', () => {
  test('properties + issue + balanceOf + totalSupply + transfer', async () => {
    await testToken({
      name: 'TestToken',
      filePath: path.resolve(__dirname, '..', '__data__', 'contracts', 'TestToken.ts'),
      smartContractName: 'testToken',
      symbol: 'TT',
      decimals: 8,
      deploy: async ({ masterAccountID, smartContract }) =>
        smartContract.deploy(masterAccountID.address, {
          from: masterAccountID,
        }) as Promise<TransactionResult<InvokeReceipt>>,
      issueValue: new BigNumber('100'),
      transferValue: new BigNumber('10'),
      description: 'The TestToken',
      payable: false,
    });
  });
  test.only('return keys', async () => {
    await withContracts(async ({ token, accountIDs }) => {
      const result1 = await token.mintTokens({
        sendTo: [
          {
            amount: new BigNumber(5),
            asset: Hash256.NEO,
          },
        ],
        from: accountIDs[2],
      });
      await token.mintTokens.confirmed({
        sendTo: [
          {
            amount: new BigNumber(5),
            asset: Hash256.NEO,
          },
        ],
        from: accountIDs[3],
      });
      await token.mintTokens.confirmed({
        sendTo: [
          {
            amount: new BigNumber(5),
            asset: Hash256.NEO,
          },
        ],
        from: accountIDs[4],
      });

      const balances = await Promise.all([
        token.balanceOf(accountIDs[2].address),
        token.balanceOf(accountIDs[3].address),
        token.balanceOf(accountIDs[4].address),
      ]);

      expect(balances[0].toNumber()).toEqual(5);
      expect(balances[1].toNumber()).toEqual(5);
      expect(balances[2].toNumber()).toEqual(5);

      const keys = await token.returnKeys();
      expect(keys).toMatchSnapshot();
    });
  });
});

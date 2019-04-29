import { InvokeReceipt, TransactionResult } from '@neo-one/client-common';
import BigNumber from 'bignumber.js';
import * as path from 'path';
import { TestSecondaryNEP5Token } from '../__data__/contracts/TestSecondaryNEP5Token';

describe('TestSecondaryNEP5Token', () => {
  test('properties + issue + balanceOf + totalSupply + transfer', async () => {
    const token = new TestSecondaryNEP5Token({
      name: 'TestSecondaryNEP5Token',
      filePath: path.resolve(__dirname, '..', '__data__', 'contracts', 'TestSecondaryNEP5Token.ts'),
      smartContractName: 'testSecondaryNEP5Token',
      symbol: 'TT',
      decimals: 8,
      deploy: async ({ masterAccountID, smartContract }) =>
        smartContract.deploy(masterAccountID.address, {
          from: masterAccountID,
        }) as Promise<TransactionResult<InvokeReceipt>>,
      issueValue: new BigNumber('100'),
      transferValue: new BigNumber('10'),
      description: 'The TestSecondaryNEP5Token',
      payable: false,
    });
  });
});

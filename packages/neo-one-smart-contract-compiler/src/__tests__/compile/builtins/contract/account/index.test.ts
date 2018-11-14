import { common } from '@neo-one/client-common';
import { helpers } from '../../../../../__data__';

describe('Account', () => {
  test('Account properties', async () => {
    const node = await helpers.startNode();
    const account = await node.readClient.getAccount(node.masterWallet.userAccount.id.address);
    await node.executeString(`
      import { Account, Address, Hash256 } from '@neo-one/smart-contract';

      const address = Address.from('${account.address}');
      const account = Account.for(address);

      account.address;
      assertEqual(account.address.equals(address), true);
      account.getBalance(Hash256.NEO);
      assertEqual(account.getBalance(Hash256.NEO), ${helpers.getDecimal(account.balances[common.NEO_ASSET_HASH])});

      interface AccountLike { getBalance: (value: Hash256) => number }
      const accountLike: AccountLike | Account = account as AccountLike | Account;
      assertEqual(accountLike['getBalance'](Hash256.GAS), ${helpers.getDecimal(
        account.balances[common.GAS_ASSET_HASH],
      )});
      assertEqual(account instanceof Account, true);
    `);
  });

  test('cannot be implemented', async () => {
    helpers.compileString(
      `
      import { Account } from '@neo-one/smart-contract';

      class MyAccount implements Account {
      }
    `,
      { type: 'error' },
    );
  });
});

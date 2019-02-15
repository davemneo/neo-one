import { Address, MapStorage } from '@neo-one/smart-contract';

export type AccessRoleMemberList = MapStorage<Address, boolean>;

export const AccessRoleHandler = {
  noOp: () => true,
};

/*
import { Address, MapStorage } from '@neo-one/smart-contract';

export type AccessRoleMemberList = MapStorage<Address, boolean>;

const isMember = (list: AccessRoleMemberList, member: Address): boolean => {
  console.log(' WER WERWE');

  return list.has(member) && list.get(member) === true;
};

export const AccessRoleHandler = {
  isMember,

  noOp: () => true,

  add: (list: AccessRoleMemberList, member: Address): boolean => {
    if (!isMember(list, member)) {
      list.set(member, true);

      return true;
    }

    return false;
  },
  remove: (list: AccessRoleMemberList, member: Address): boolean => {
    if (isMember(list, member)) {
      list.delete(member);

      return true;
    }

    return false;
  },
};

*/

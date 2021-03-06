import { getCreateSmartContractName } from '../contract';
import { ContractPaths } from '../type';
import { getRelativeImport, lowerCaseFirst } from '../utils';

export const genReact = ({
  contractsPaths,
  reactPath,
  commonTypesPath,
  clientPath,
  browser,
}: {
  readonly contractsPaths: ReadonlyArray<ContractPaths>;
  readonly reactPath: string;
  readonly commonTypesPath: string;
  readonly clientPath: string;
  readonly browser: boolean;
}) => ({
  js: `
import { DeveloperTools } from '@neo-one/client${browser ? '-browserify' : ''}';
import * as React from 'react';
import { createClient, createDeveloperClients, createLocalClients } from '${getRelativeImport(reactPath, clientPath)}';
${contractsPaths
  .map(
    ({ name, createContractPath }) =>
      `import { ${getCreateSmartContractName(name)} } from '${getRelativeImport(reactPath, createContractPath)}';`,
  )
  .join('\n')}

const Context = React.createContext(undefined);

export const ContractsProvider = ({
  client: clientIn,
  developerClients: developerClientsIn,
  localClients: localClientsIn,
  host,
  children,
}) => {
  const client = clientIn === undefined ? createClient(host) : clientIn;
  const developerClients = developerClientsIn === undefined ? createDeveloperClients(host) : developerClientsIn;
  const localClients = localClientsIn === undefined ? createLocalClients(host) : localClientsIn;
  DeveloperTools.enable({ client, developerClients, localClients });

  return (
    <Context.Provider
      value={{
        client,
        developerClients,
        localClients,
        ${contractsPaths
          .map(({ name }) => `${lowerCaseFirst(name)}: ${getCreateSmartContractName(name)}(client),`)
          .join('\n      ')}
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const WithContracts = ({ children }) => (
  <Context.Consumer>
    {children}
  </Context.Consumer>
);
`,
  ts: `
import { Client, DeveloperClient, DeveloperTools, LocalClient } from '@neo-one/client${browser ? '-browserify' : ''}';
import * as React from 'react';
import { Contracts } from '${getRelativeImport(reactPath, commonTypesPath)}';
import { createClient, createDeveloperClients, createLocalClients } from '${getRelativeImport(reactPath, clientPath)}';

${contractsPaths
  .map(
    ({ name, createContractPath }) =>
      `import { ${getCreateSmartContractName(name)} } from '${getRelativeImport(reactPath, createContractPath)}';`,
  )
  .join('\n')}

export interface WithClients<TClient extends Client> {
  readonly client: TClient;
  readonly developerClients: {
    readonly [network: string]: DeveloperClient;
  };
  readonly localClients: {
    readonly [network: string]: LocalClient;
  };
  readonly host?: string;
}
export type ContractsWithClients<TClient extends Client> = Contracts & WithClients<TClient>;
const Context: any = React.createContext<ContractsWithClients<Client>>(undefined as any);

export type ContractsProviderProps<TClient extends Client> = Partial<WithClients<TClient>> & {
  readonly children?: React.ReactNode;
}
export const ContractsProvider = <TClient extends Client>({
  client: clientIn,
  developerClients: developerClientsIn,
  localClients: localClientsIn,
  host,
  children,
}: ContractsProviderProps<TClient>) => {
  const client = clientIn === undefined ? createClient(host) : clientIn;
  const developerClients = developerClientsIn === undefined ? createDeveloperClients(host) : developerClientsIn;
  const localClients = localClientsIn === undefined ? createLocalClients(host) : localClientsIn;
  DeveloperTools.enable({ client, developerClients, localClients });

  return (
    <Context.Provider
      value={{
        client,
        developerClients,
        localClients,
        ${contractsPaths
          .map(({ name }) => `${lowerCaseFirst(name)}: ${getCreateSmartContractName(name)}(client),`)
          .join('\n      ')}
      }}
    >
      {children}
    </Context.Provider>
  );
};

export interface WithContractsProps<TClient extends Client> {
  readonly children: (contracts: ContractsWithClients<TClient>) => React.ReactNode;
}
export const WithContracts = <TClient extends Client>({ children }: WithContractsProps<TClient>) => (
  <Context.Consumer>
    {children}
  </Context.Consumer>
);
  `,
});

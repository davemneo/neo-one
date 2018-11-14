---
id: read-client-api
title: Read Client API
---
This is the API documentation for the NEO•ONE Read Client. The Read Client is accessed through the [read](/docs/en/client-api.html#read) method on the Client and is primarily used to retrieve information about the blockchain.

```ts
const readClient = client.read(networkName);
```

## Methods
  - [getAccount](#getAccount)
  - [getAsset](#getAsset)
  - [getBlock](#getBlock)
  - [iterBlocks](#iterBlocks)
  - [getBestBlockHash](#getBestBlockHash)
  - [getBlockCount](#getBlockCount)
  - [getContract](#getContract)
  - [getMemPool](#getMemPool)
  - [getTransaction](#getTransaction)
  - [getOutput](#getOutput)
  - [getConnectedPeers](#getConnectedPeers)
  - [smartContract](#smartContract)
  - [getStorage](#getStorage)
  - [iterStorage](#iterStorage)

## Methods Reference

<a id="getAccount"></a>
#### getAccount([AddressString](/docs/en/client-types.html#AddressString)): Promise<[Account](/docs/en/client-types.html#Account)>
  - Used to obtain an [Account](/docs/en/client-types.html#Account) from an input [AddressString](/docs/en/client-types.html#AddressString).
  - Example:
    ```ts
    const networkName = 'private';
    const address = 'APyEx5f4Zm4oCHwFWiSTaph1fPBxZacYVR';

    const readClient = client.read(networkName);
    const account = await readClient.getAccount(address);

    const neoBalance = account.balances[Hash256.NEO];
    ```

<a id="getAsset"></a>
#### getAsset([Hash256String](/docs/en/client-types.html#Hash256String)): Promise<[Asset](/docs/en/client-types.html#Asset)>
  - Used to obtain an [Asset](/docs/en/client-types.html#Asset) identified by its given [Hash256String](/docs/en/client-types.html#Hash256String) id.
  - Example:
    ```ts
    const readClient = client.read('private');

    const neoAsset = await readClient.getAsset(Hash256.NEO);
    const totalNEOSupply = neoAsset.amount;
    ```

<a id="getBlock"></a>
#### getBlock(number | [Hash256String](/docs/en/client-types.html#Hash256String), [GetOptions?](/docs/en/client-types.html#GetOptions)): Promise<[Block](/docs/en/client-types.html#Block)>
  - Retrieve a [Block](/docs/en/client-types.html#Block) identified by its index or [Hash256String](/docs/en/client-types.html#Hash256String) identifier.
  - Optionally pass in a [GetOptions](/docs/en/client-types.html#GetOptions) object as the second argument to set a timeout.
  - Example:
    ```ts
    const readClient = client.read('private');

    const genesisBlock = await readClient.getBlock(0);
    const genesisTime = genesisBlock.time;
    ```

<a id="iterBlocks">
#### iterBlocks([BlockFilter?](/docs/en/client-types.html#BlockFilter)): AsyncIterable<[Block](/docs/en/client-types.html#Block)>
  - Returns a stream of [Blocks](/docs/en/client-types.html#Block) as they become available.
  - Filter the [Blocks](/docs/en/client-types.html#Block) by passing in an optional [BlockFilter](/docs/en/client-types.html#BlockFilter).
  - Example:
    ```ts
    import { toArray } from '@reactivex/ix-es2015-cjs/asynciterable/toarray';
    ...

    const firstThousandBlocks = await toArray(client.read(networkName).iterBlocks({indexStart: 0, indexStop: 1000}));
    const firstThousandBlockTimes = firstThousandBlocks.map((block) => block.time);
    ```

<a id="getBestBlockHash"></a>
#### getBestBlockHash(): Promise<[Hash256String](/docs/en/client-types.html#Hash256String)>
  - Returns the [Hash256String](/docs/en/client-types.html#Hash256String) identifier for the most recent available [Block](/docs/en/client-types.html#Block).
  - Example:
    ```ts
    const readClient = client.read(networkName);

    const bestBlockHash = await readClient.getBestBlockHash();
    const bestBlock = await readClient.getBlock(bestBlockHash);
    ```

<a id="getBlockCount"></a>
#### getBlockCount(): Promise\<number\>
  - Returns the index of the most recent available [Block](/docs/en/client-types.html#Block).
  - Example:
    ```ts
    const readClient = client.read(networkName);

    const blockCount = await readClient.getBlockCount();
    if (blockCount > triggerHeight) {
      // do something
    };
    ```

<a id="getContract"></a>
#### getContract([AddressString](/docs/en/client-types.html#AddressString)): Promise<[Contract](/docs/en/client-types.html#Contract)>
  - Returns a [Contract](/docs/en/client-types.html#Contract) associated with a given [AddressString](/docs/en/client-types.html#AddressString)
  - Example:
    ```ts
    async function getContractName(contractAddress: AddressString, readClient: ReadClient): Promise<string> {
      const contract = await readClient.getContract(contractAddress);

      return contract.name;
    }
    ```

<a id="getMemPool"></a>
#### getMemPool(): Promise\<ReadonlyArray<[Hash256String](/docs/en/client-types.html#Hash256String)>\>
  - Returns the current Mem Pool.
  - The Mem Pool is the pool of [Transactions](/docs/en/client-types.html#Transaction) waiting to be added into a [Block](/docs/en/client-types.html#Block) and is stored as an array of [Transaction](/docs/en/client-types.html#Transaction) [Hash256String](/docs/en/client-types.html#Hash256String) identifiers.
  - Example:
    ```ts
    const memPool = await client.read(networkName).getMemPool();

    const pendingTransactionCount = memPool.length;
    ```

<a id="getTransaction"></a>
#### getTransaction([Hash256String](/docs/en/client-types.html#Hash256String)): Promise<[Transaction](/docs/en/client-types.html#Transaction)>
  - Returns the [Transaction](/docs/en/client-types.html#Transaction) associated with the given [Hash256String](/docs/en/client-types.html#Hash256String) identifier.
  - Example:
    ```ts
    async function getNetworkFee(transactionHash: Hash256String, readClient: ReadClient): Promise<BigNumber> {
      const transaction = await readClient.getTransaction(transactionHash);

      return transaction.networkFee;
    }
    ```

<a id="getOutput"></a>
#### getOutput([Input](/docs/en/client-types.html#Input)): Promise<[Output](/docs/en/client-types.html#Output)>
  - Returns the [Output](/docs/en/client-types.html#Output) referenced by the given [Input](/docs/en/client-types.html#Input).
  - Example:
    ```ts
    async function getInputValue(input: Input, readClient: ReadClient) {
      const output = await readClient.getOutput(input);

      return output.value;
    }
    ```

<a id="getConnectedPeers"></a>
#### getConnectedPeers(): Promise\<ReadonlyArray<[Peer](/docs/en/client-types.html#Peer)>\>
  - Returns an array of the connected Nodes.

<a id="smartContract"></a>
#### smartContract\<T extends [ReadSmartContract](/docs/en/client-types.html#ReadSmartContract)\>([ReadSmartContractDefinition]()): T
  - Returns a [ReadSmartContract](/docs/en/client-types.html#ReadSmartContract) for a given [ReadSmartContractDefinition]().

<a id="getStorage"></a>
#### getStorage([AddressString](/docs/en/client-types.html#AddressString), [BufferString](/docs/en/client-types.html#BufferString)): Promise<[StorageItem](/docs/en/client-types.html#StorageItem)>
  - Returns the persistent storage for the [Contract](/docs/en/client-types.html#Contract) associated with the given [AddressString](/docs/en/client-types.html#AddressString).
  - The [StorageItem](/docs/en/client-types.html#StorageItem) returned is the one associated with the given key represented as a [BufferString](/docs/en/client-types.html#BufferString).

<a id="iterStorage"></a>
#### iterStorage([AddressString](/docs/en/client-types.html#AddressString)): AsyncIterable<[StorageItem](/docs/en/client-types.html#StorageItem)>
  - Returns a stream of [StorageItems](/docs/en/client-types.html#StorageItem) in persistent storage for the [Contract](/docs/en/client-types.html#Contract) associated with the given [AddressString](/docs/en/client-types.html#AddressString) as they become available.

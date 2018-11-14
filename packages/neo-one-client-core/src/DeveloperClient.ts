import { DeveloperProvider, PrivateNetworkSettings } from '@neo-one/client-common';
import { enqueuePostPromiseJob } from '@neo-one/utils';

/**
 * Client which controls a development network.
 */
export class DeveloperClient {
  private readonly developerProvider: DeveloperProvider;
  private mutableRunConsensusNow: Promise<void> | undefined;

  public constructor(developerProvider: DeveloperProvider) {
    this.developerProvider = developerProvider;
  }

  /**
   * Trigger consensus to run immediately.
   */
  public async runConsensusNow(): Promise<void> {
    if (this.mutableRunConsensusNow === undefined) {
      this.mutableRunConsensusNow = new Promise((resolve, reject) => {
        enqueuePostPromiseJob(() => {
          this.runConsensusNowInternal()
            .then(resolve)
            .catch(reject);
        });
      });
    }

    return this.mutableRunConsensusNow;
  }

  /**
   * Update settings for the private network.
   */
  public async updateSettings(options: Partial<PrivateNetworkSettings>): Promise<void> {
    await this.developerProvider.updateSettings(options);
  }

  /**
   * Get the current settings of the private network.
   */
  public async getSettings(): Promise<PrivateNetworkSettings> {
    return this.developerProvider.getSettings();
  }

  /**
   * Fast forward the local network by `seconds` into the future.
   */
  public async fastForwardOffset(seconds: number): Promise<void> {
    await this.developerProvider.fastForwardOffset(seconds);
    await this.runConsensusNow();
  }

  /**
   * Fast forward to a particular unix timestamp in the future.
   */
  public async fastForwardToTime(seconds: number): Promise<void> {
    await this.developerProvider.fastForwardToTime(seconds);
    await this.runConsensusNow();
  }

  /**
   * Reset the local network to it's initial state starting at the genesis block.
   */
  public async reset(): Promise<void> {
    await this.developerProvider.reset();
  }

  private async runConsensusNowInternal(): Promise<void> {
    await this.developerProvider.runConsensusNow();
    this.mutableRunConsensusNow = undefined;
  }
}

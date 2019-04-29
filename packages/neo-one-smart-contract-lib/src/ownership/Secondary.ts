import { Address, createEventNotifier, SmartContract } from '@neo-one/smart-contract';

export function Secondary<TBase extends Constructor<SmartContract>>(base: TBase) {
  // With the code in one state, it complains about "base" Class extends value undefined is not a constructor or null
  abstract class SecondaryClass extends base {
    protected abstract readonly initialPrimary: Address;
    // Yes, the "readonly" is missing, would it be reasonable to create an issue to make this error more robust?
    protected readonly notifyTransferPrimary = createEventNotifier<Address, Address>('transfer_primary', 'from', 'to');
    private mutablePrimary: Address | undefined = undefined;
    private mutablePrimaryInitialized = false;

    public get primary(): Address | undefined {
      return this.mutablePrimary !== undefined ? this.mutablePrimary : this.initializePrimary();
    }

    public transferPrimary(to: Address): boolean {
      this.onlyPrimary();
      const primary = this.primaryOrThrow();
      this.notifyTransferPrimary(primary, to);
      this.mutablePrimary = to;

      return true;
    }

    protected primaryOrThrow(): Address {
      const primary = this.primary;

      if (primary === undefined) {
        throw new Error('no primary');
      }

      return primary;
    }

    protected onlyPrimary() {
      if (!Address.isCaller(this.primaryOrThrow())) {
        throw new Error('not primary');
      }
    }

    private initializePrimary() {
      if (this.mutablePrimary === undefined && !this.mutablePrimaryInitialized) {
        this.mutablePrimary = this.initialPrimary;
        this.mutablePrimaryInitialized = true;
      }

      return this.mutablePrimary;
    }
  }

  return SecondaryClass;
}

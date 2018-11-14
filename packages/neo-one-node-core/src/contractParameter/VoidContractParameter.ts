import { VoidContractParameterJSON } from '@neo-one/client-common';
import { DeserializeWireBaseOptions, SerializeJSONContext } from '../Serializable';
import { ContractParameterBase } from './ContractParameterBase';
import { ContractParameterType } from './ContractParameterType';

export class VoidContractParameter extends ContractParameterBase<
  VoidContractParameter,
  VoidContractParameterJSON,
  ContractParameterType.Void
> {
  public static deserializeWireBase(options: DeserializeWireBaseOptions): VoidContractParameter {
    super.deserializeContractParameterBaseWireBase(options);

    return new this();
  }

  public readonly type = ContractParameterType.Void;
  public readonly size: number = 0;

  public asBoolean(): boolean {
    return false;
  }

  public serializeJSON(_context: SerializeJSONContext): VoidContractParameterJSON {
    return {
      type: 'Void',
    };
  }
}

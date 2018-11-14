import { BinaryWriter } from '../../../BinaryWriter';
import { createSerializeWire, SerializableWire, SerializeWire } from '../../Serializable';
import { AttributeModel } from './AttributeModel';
import { AttributeUsageModel } from './AttributeUsageModel';

export abstract class AttributeBaseModel<Usage extends AttributeUsageModel, Value extends Buffer>
  implements SerializableWire<AttributeModel> {
  public abstract readonly usage: Usage;
  public abstract readonly value: Value;
  public readonly serializeWire: SerializeWire = createSerializeWire(this.serializeWireBase.bind(this));

  public serializeWireBase(writer: BinaryWriter): void {
    writer.writeUInt8(this.usage);
  }
}

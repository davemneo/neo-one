import { Node } from 'ts-simple-ast';

import { Helper } from '../../Helper';
import { ScriptBuilder } from '../../../sb';
import { VisitOptions } from '../../../types';
import { Types } from '../Types';

// Input: []
// Output: [objectVal]
export class PackObjectHelper extends Helper<Node> {
  public emit(sb: ScriptBuilder, node: Node, options: VisitOptions): void {
    if (options.pushValue) {
      sb.emitOp(node, 'PACK');
      // [objectType, object]
      sb.emitPushInt(node, Types.Object);
      /* create object */
      // [2, objectType, object]
      sb.emitPushInt(node, 2);
      // [objectVal]
      sb.emitOp(node, 'PACK');
      }
  }
}

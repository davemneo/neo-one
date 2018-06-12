import { Node } from 'ts-simple-ast';

import { Helper } from '../../Helper';
import { ScriptBuilder } from '../../../sb';
import { VisitOptions } from '../../../types';

// Input: []
// Output: [objectVal]
export class CreateObjectHelper extends Helper<Node> {
  public emit(sb: ScriptBuilder, node: Node, options: VisitOptions): void {
    if (options.pushValue) {
      /* create internal object */
      // [iobj]
      sb.emitOp(node, 'NEWMAP');

      /* create symbol obj */
      // [sobj, iobj]
      sb.emitOp(node, 'NEWMAP');

      /* create obj */
      // [pobj, sobj, iobj]
      sb.emitOp(node, 'NEWMAP');

      /* create object array */
      // [3, pobj, sobj, iobj]
      sb.emitPushInt(node, 3);
      // [object]
      sb.emitHelper(node, options, sb.helpers.packObject);
    }
  }
}

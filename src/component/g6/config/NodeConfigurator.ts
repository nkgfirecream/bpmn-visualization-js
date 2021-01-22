/**
 * Copyright 2020 Bonitasoft S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ShapeBpmnElementKind } from '../../../model/bpmn/internal/shape';
import G6 from '@antv/g6';
import { drawEvent } from '../node/event-nodes';
import { drawTask } from '../node/activity-nodes';
import { drawTextAnnotation } from '../node/text-annotation-nodes';
import { drawGateway } from '../node/gateway-nodes';
import { drawSwinlane } from '../node/swinlane-nodes';

export default class NodeConfigurator {
  public configureNodes(): void {
    this.registerNodes();
  }

  private registerNodes(): void {
    /*    G6.registerNode(
      'nodeName',
      {
        options: {
          style: {},
          stateStyles: {
            hover: {},
            selected: {},
          },
        },
        /!**
         * Draw the node with label
         * @param  {Object} cfg The configurations of the node
         * @param  {G.Group} group Graphics group, the container of the shapes of the node
         * @return {G.Shape} The keyShape of the node. It can be obtained by node.get('keyShape')
         *!/
        draw(cfg, group) {},
        /!**
         * The extra operations after drawing the node. There is no operation in this function by default
         * @param  {Object} cfg The configurations of the node
         * @param  {G.Group} group Graphics group, the container of the shapes of the node
         *!/
        afterDraw(cfg, group) {},
        /!**
         * Update the node and its label
         * @override
         * @param  {Object} cfg The configurations of the node
         * @param  {Node} node The node item
         *!/
        update(cfg, node) {},
        /!**
         * The operations after updating the node. It is combined with afterDraw generally
         * @override
         * @param  {Object} cfg The configurations of the node
         * @param  {Node} node The node item
         *!/
        afterUpdate(cfg, node) {},
        /!**
         * Should be rewritten when you want to response the state changes by animation.
         * Responsing the state changes by styles can be configured, which is described in the document Middle-Behavior & Event-State
         * @param  {String} name The name of the state
         * @param  {Object} value The value of the state
         * @param  {Node} node The node item
         *!/
        setState(name, value, node) {},
        /!**
         * Get the anchorPoints(link points for related edges)
         * @param  {Object} cfg The configurations of the node
         * @return {Array|null} The array of anchorPoints(link points for related edges). Null means there are no anchorPoints
         *!/
        getAnchorPoints(cfg) {},
      },
      extendedNodeName,
    );*/

    G6.registerNode(ShapeBpmnElementKind.POOL, { drawShape: drawSwinlane() }, 'single-node');
    G6.registerNode(ShapeBpmnElementKind.LANE, { drawShape: drawSwinlane() });

    // events
    G6.registerNode(ShapeBpmnElementKind.EVENT_END, { drawShape: drawEvent() }, 'single-node');
    G6.registerNode(ShapeBpmnElementKind.EVENT_START, { drawShape: drawEvent() }, 'circle');
    G6.registerNode(ShapeBpmnElementKind.EVENT_INTERMEDIATE_THROW, { drawShape: drawEvent() }, 'circle');
    G6.registerNode(ShapeBpmnElementKind.EVENT_INTERMEDIATE_CATCH, { drawShape: drawEvent() }, 'circle');
    G6.registerNode(ShapeBpmnElementKind.EVENT_BOUNDARY, { drawShape: drawEvent() }, 'circle');

    // gateways
    G6.registerNode(ShapeBpmnElementKind.GATEWAY_EVENT_BASED, { drawShape: drawGateway() }, 'diamond');
    G6.registerNode(ShapeBpmnElementKind.GATEWAY_EXCLUSIVE, { drawShape: drawGateway() }, 'diamond');
    G6.registerNode(ShapeBpmnElementKind.GATEWAY_INCLUSIVE, { drawShape: drawGateway() }, 'diamond');
    G6.registerNode(ShapeBpmnElementKind.GATEWAY_PARALLEL, { drawShape: drawGateway() }, 'diamond');

    // activities
    G6.registerNode(ShapeBpmnElementKind.SUB_PROCESS, { drawShape: drawTask() }, 'rect');
    G6.registerNode(ShapeBpmnElementKind.CALL_ACTIVITY, { drawShape: drawTask() }, 'rect');

    // tasks
    G6.registerNode(ShapeBpmnElementKind.TASK, { drawShape: drawTask() });
    G6.registerNode(ShapeBpmnElementKind.TASK_SERVICE, { drawShape: drawTask() }, 'rect');
    G6.registerNode(ShapeBpmnElementKind.TASK_USER, { drawShape: drawTask() }, 'rect');
    G6.registerNode(ShapeBpmnElementKind.TASK_RECEIVE, { drawShape: drawTask() }, 'rect');
    G6.registerNode(ShapeBpmnElementKind.TASK_SEND, { drawShape: drawTask() }, 'rect');
    G6.registerNode(ShapeBpmnElementKind.TASK_MANUAL, { drawShape: drawTask() }, 'rect');
    G6.registerNode(ShapeBpmnElementKind.TASK_SCRIPT, { drawShape: drawTask() }, 'rect');
    G6.registerNode(ShapeBpmnElementKind.TASK_BUSINESS_RULE, { drawShape: drawTask() }, 'rect');

    // artifacts
    G6.registerNode(ShapeBpmnElementKind.TEXT_ANNOTATION, { drawShape: drawTextAnnotation() }, 'single-node');
  }
  
  /*
private initMxShapePrototype(isFF: boolean): void {
  // The following is copied from the mxgraph mxShape implementation then converted to TypeScript and enriched for bpmn-visualization
  // It is needed for adding the custom attributes that permits identification of the BPMN elements in the DOM
  mxShape.prototype.createSvgCanvas = function () {
    const canvas = new mxSvgCanvas2D(this.node, false);
    canvas.strokeTolerance = this.pointerEvents ? this.svgStrokeTolerance : 0;
    canvas.pointerEventsValue = this.svgPointerEvents;
    // TODO existed in mxgraph-type-definitions@1.0.2, no more in mxgraph-type-definitions@1.0.3
    // this is probably because mxSvgCanvas2D definition matches mxgraph@4.1.1 and we are using  mxgraph@4.1.0
    ((canvas as unknown) as mxgraph.mxSvgCanvas2D).blockImagePointerEvents = isFF;
    const off = this.getSvgScreenOffset();

    if (off != 0) {
      this.node.setAttribute('transform', 'translate(' + off + ',' + off + ')');
    } else {
      this.node.removeAttribute('transform');
    }

      // TODO existed in mxgraph-type-definitions@1.0.2, no more in mxgraph-type-definitions@1.0.3
      // this is probably because mxSvgCanvas2D definition matches mxgraph@4.1.1 and we are using  mxgraph@4.1.0
      ((canvas as unknown) as mxgraph.mxSvgCanvas2D).blockImagePointerEvents = isFF;
      const off = this.getSvgScreenOffset();

      if (off != 0) {
        this.node.setAttribute('transform', 'translate(' + off + ',' + off + ')');
      } else {
        this.node.removeAttribute('transform');
      }

      // START bpmn-visualization CUSTOMIZATION
      // add attributes to be able to identify elements in DOM
      if (this.state && this.state.cell) {
        // 'this.state.style' = the style definition associated with the cell
        // 'this.state.cell.style' = the style applied to the cell: 1st element: style name = bpmn shape name
        const cell = this.state.cell;
        // dialect = strictHtml is set means that current node holds an html label
        let allBpmnClassNames = computeAllBpmnClassNames(extractBpmnKindFromStyle(cell), this.dialect === mxConstants.DIALECT_STRICTHTML);
        // TODO change the computeAllBpmnClassNames implementation to return an array and manage the string join here instead
        const extraCssClasses =  this.state.style[StyleIdentifier.BPMN_STYLE_EXTRA_CSS_CLASSES];
        if (extraCssClasses) {
          allBpmnClassNames = allBpmnClassNames.concat(' ').concat(extraCssClasses);
        }

      this.node.setAttribute('class', allBpmnClassNames);
      this.node.setAttribute('data-bpmn-id', this.state.cell.id);
    }
    // END bpmn-visualization CUSTOMIZATION
    canvas.minStrokeWidth = this.minSvgStrokeWidth;

    if (!this.antiAlias) {
      // Rounds all numbers in the SVG output to integers
      canvas.format = function (value: string) {
        return Math.round(parseFloat(value));
      };
    }

    return canvas;
  };
}
*/
}



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
import { mxgraph } from '../initializer';
import { ShapeBpmnElementKind } from '../../../model/bpmn/internal/shape';
import { BoundaryEventShape, CatchIntermediateEventShape, EndEventShape, StartEventShape, ThrowIntermediateEventShape } from '../shape/event-shapes';
import { EventBasedGatewayShape, ExclusiveGatewayShape, InclusiveGatewayShape, ParallelGatewayShape } from '../shape/gateway-shapes';
import {
  BusinessRuleTaskShape,
  CallActivityShape,
  ManualTaskShape,
  ReceiveTaskShape,
  ScriptTaskShape,
  SendTaskShape,
  ServiceTaskShape,
  SubProcessShape,
  TaskShape,
  UserTaskShape,
} from '../shape/activity-shapes';
import { TextAnnotationShape } from '../shape/text-annotation-shapes';
import { MessageFlowIconShape } from '../shape/flow-shapes';
import { StyleIdentifier } from '../StyleUtils';
import { computeAllBpmnClassNames, extractBpmnKindFromStyle } from '../style-helper';

export default class ShapeConfigurator {
  public configureShapes(): void {
    this.initMxShapePrototype();
    this.registerShapes();
  }

  private registerShapes(): void {
    // events
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.EVENT_END, EndEventShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.EVENT_START, StartEventShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.EVENT_INTERMEDIATE_THROW, ThrowIntermediateEventShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.EVENT_INTERMEDIATE_CATCH, CatchIntermediateEventShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.EVENT_BOUNDARY, BoundaryEventShape);
    // gateways
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.GATEWAY_EVENT_BASED, EventBasedGatewayShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.GATEWAY_EXCLUSIVE, ExclusiveGatewayShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.GATEWAY_INCLUSIVE, InclusiveGatewayShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.GATEWAY_PARALLEL, ParallelGatewayShape);
    // activities
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.SUB_PROCESS, SubProcessShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.CALL_ACTIVITY, CallActivityShape);
    // tasks
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TASK, TaskShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TASK_SERVICE, ServiceTaskShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TASK_USER, UserTaskShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TASK_RECEIVE, ReceiveTaskShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TASK_SEND, SendTaskShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TASK_MANUAL, ManualTaskShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TASK_SCRIPT, ScriptTaskShape);
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TASK_BUSINESS_RULE, BusinessRuleTaskShape);
    // artifacts
    mxgraph.mxCellRenderer.registerShape(ShapeBpmnElementKind.TEXT_ANNOTATION, TextAnnotationShape);

    // shapes for flows
    mxgraph.mxCellRenderer.registerShape(StyleIdentifier.BPMN_STYLE_MESSAGE_FLOW_ICON, MessageFlowIconShape);
  }

  private initMxShapePrototype(): void {
    // The following is copied from the mxgraph mxShape implementation then converted to TypeScript and enriched for bpmn-visualization
    // It is needed for adding the custom attributes that permits identification of the BPMN elements in the DOM
    mxgraph.mxShape.prototype.createSvgCanvas = function () {
      const canvas = new mxgraph.mxSvgCanvas2D(this.node, false);
      canvas.strokeTolerance = this.pointerEvents ? this.svgStrokeTolerance : 0;
      canvas.pointerEventsValue = this.svgPointerEvents;
      // TODO remove this commented code (has been removed in mxgraph@4.1.1
      //((canvas as unknown) as mxgraph.mxSvgCanvas2D).blockImagePointerEvents = isFF;
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
        // dialect = strictHtml means that current node holds the label
        const allBpmnClassNames = computeAllBpmnClassNames(extractBpmnKindFromStyle(cell), this.dialect === 'strictHtml');

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
}

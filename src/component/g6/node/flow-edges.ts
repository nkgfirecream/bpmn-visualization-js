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
/*
import { buildPaintParameter, IconPainterProvider } from './render';
import { MessageVisibleKind } from '../../../model/bpmn/internal/edge/MessageVisibleKind';
import StyleUtils from '../../mxgraph/StyleUtils';

export class MessageFlowIconShape extends mxRectangleShape {
  protected iconPainter = IconPainterProvider.get();

  public constructor(bounds: mxRectangle, fill: string, stroke: string, strokewidth: number) {
    super(bounds, fill, stroke, strokewidth);
  }

  public paintVertexShape(c: mxAbstractCanvas2D, x: number, y: number, w: number, h: number): void {
    const withFilledIcon = StyleUtils.getBpmnIsInitiating(this.style) === MessageVisibleKind.NON_INITIATING;
    const paintParameter = buildPaintParameter(c, x, y, w, h, this, 1, withFilledIcon);

    this.iconPainter.paintEnvelopeIcon(paintParameter);
  }
}
*/

import { Group as GGroup } from '@antv/g-canvas';
import { IShape } from '@antv/g-canvas/lib/interfaces';
import { BpmnG6EdgeConfig } from '../G6Renderer';
import { ShapeOptions } from '@antv/g6/lib/interface/shape';
import G6 from '@antv/g6';

// private specificFlowStyles: Map<FlowKind, (style: StyleMap) => void> = new Map([
//   [
//     FlowKind.SEQUENCE_FLOW,
//     (style: StyleMap) => {
//       style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK_THIN;
//     },
//   ],
//   [
//     FlowKind.MESSAGE_FLOW,
//     (style: StyleMap) => {
//       style[mxConstants.STYLE_DASHED] = true;
//       style[mxConstants.STYLE_DASH_PATTERN] = '8 5';
//       style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_OVAL;
//       style[mxConstants.STYLE_STARTSIZE] = 8;
//       style[mxConstants.STYLE_STARTFILL] = false;
//       style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK_THIN;
//       style[mxConstants.STYLE_ENDFILL] = false;
//     },
//   ],
//   [
//     FlowKind.ASSOCIATION_FLOW,
//     (style: StyleMap) => {
//       style[mxConstants.STYLE_DASHED] = true;
//       style[mxConstants.STYLE_DASH_PATTERN] = '1 2';
//       style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_OPEN_THIN;
//       style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_OPEN_THIN;
//       style[mxConstants.STYLE_STARTSIZE] = 12;
//     },
//   ],
// ]);

// private specificAssociationFlowStyles: Map<AssociationDirectionKind, (style: StyleMap) => void> = new Map([
//   [
//     AssociationDirectionKind.NONE,
//     (style: StyleMap) => {
//       style[mxConstants.STYLE_STARTARROW] = undefined;
//       style[mxConstants.STYLE_ENDARROW] = undefined;
//       style[mxConstants.STYLE_EDGE] = undefined; // ensure no orthogonal segments, see also https://github.com/process-analytics/bpmn-visualization-js/issues/295
//     },
//   ],
//   [
//     AssociationDirectionKind.ONE,
//     (style: StyleMap) => {
//       style[mxConstants.STYLE_STARTARROW] = undefined;
//       style[mxConstants.STYLE_EDGE] = undefined; // ensure no orthogonal segments, see also https://github.com/process-analytics/bpmn-visualization-js/issues/295
//     },
//   ],
//   [
//     AssociationDirectionKind.BOTH,
//     (style: StyleMap) => {
//       style[mxConstants.STYLE_EDGE] = undefined; // ensure no orthogonal segments, see also https://github.com/process-analytics/bpmn-visualization-js/issues/295
//     },
//   ],
// ]);

export function getSequenceFlowDefinition(): ShapeOptions {
  return {
    options: {
      type: 'polyline',
      style: {
        stroke: '#ccc',
        endArrow: {
          path: G6.Arrow.triangle(10, 20, 25),
          d: 25,
        },
      },
    },
    draw: drawSequenceFlow(),
    afterDraw: afterDrawSequenceFlow(),
    // update: undefined,
  };
}
function drawSequenceFlow(): (cfg?: BpmnG6EdgeConfig, group?: GGroup) => IShape {
  return (cfg, group): IShape => {
    const startPoint = cfg.startPoint;
    const endPoint = cfg.endPoint;

    // style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK_THIN;

    // private specificSequenceFlowStyles: Map<SequenceFlowKind, (style: StyleMap) => void> = new Map([
    //   [
    //     SequenceFlowKind.DEFAULT,
    //     (style: StyleMap) => {
    //       style[mxConstants.STYLE_STARTARROW] = MarkerIdentifier.ARROW_DASH;
    //     },
    //   ],
    //   [
    //     SequenceFlowKind.CONDITIONAL_FROM_ACTIVITY,
    //     (style: StyleMap) => {
    //       style[mxConstants.STYLE_STARTARROW] = mxConstants.ARROW_DIAMOND_THIN;
    //       style[mxConstants.STYLE_STARTSIZE] = 18;
    //       style[mxConstants.STYLE_STARTFILL] = false;
    //     },
    //   ],
    // ]);

    const endArrow = (cfg.style && cfg.style.endArrow) || {
      path: G6.Arrow.triangle(10, 20, 25),
      d: 25,
    };

    let points = [startPoint]; // the start point
    // the control points
    if (cfg.controlPoints) {
      points = points.concat(cfg.controlPoints);
    }
    // the end point
    points.push(endPoint);

    return group.addShape('path', {
      attrs: {
        stroke: '#333',
        lineWidth: 1,
        source: cfg.source,
        target: cfg.target,
        // path: [
        //   ['M', startPoint.x, startPoint.y],
        //   ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 1/3
        //   ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 2/3
        //   ['L', endPoint.x, endPoint.y],
        // ],
        style: {
          endArrow,
        },
        endArrow,

        label: cfg.label,
        labelCfg: {
          refX: 10, // x offset of the label
          refY: 10, // y offset of the label
          style: {
            fill: '#595959',
          },
        },
      },
      className: 'edge-shape',
      // must be assigned in G6 3.3 and later versions. it can be any value you want
      name: 'path-shape',
    });
  };
}
function afterDrawSequenceFlow(): (cfg?: BpmnG6EdgeConfig, group?: GGroup) => IShape {
  return (cfg, group): IShape => {
    // get the first shape in the graphics group of this edge, it is the path of the edge here
    const shape = group.get('children')[0];
    // get the coordinate of the mid point on the path
    const midPoint = shape.getPoint(0.5);
    // add a rect on the mid point of the path. note that the origin of a rect shape is on its lefttop
    return group.addShape('rect', {
      attrs: {
        width: 10,
        height: 10,
        fill: '#f00',
        // x and y should be minus width / 2 and height / 2 respectively to translate the center of the rect to the midPoint
        x: midPoint.x - 5,
        y: midPoint.y - 5,
      },
    });
  };
}

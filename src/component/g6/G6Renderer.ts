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
import Shape from '../../model/bpmn/internal/shape/Shape';
import Edge from '../../model/bpmn/internal/edge/Edge';
import BpmnModel from '../../model/bpmn/internal/BpmnModel';
import ShapeBpmnElement, {
  ShapeBpmnActivity,
  ShapeBpmnBoundaryEvent,
  ShapeBpmnEvent,
  ShapeBpmnEventBasedGateway,
  ShapeBpmnStartEvent,
  ShapeBpmnSubProcess,
} from '../../model/bpmn/internal/shape/ShapeBpmnElement';
import ShapeUtil from '../../model/bpmn/internal/shape/ShapeUtil';
import { ShapeBpmnElementKind, ShapeBpmnEventBasedGatewayKind, ShapeBpmnEventKind, ShapeBpmnMarkerKind, ShapeBpmnSubProcessKind } from '../../model/bpmn/internal/shape';
import { LoadOptions } from '../options';
import { Graph, EdgeConfig, GraphData, IPoint, NodeConfig } from '@antv/g6/es';
import { SequenceFlowKind } from '../../model/bpmn/internal/edge/SequenceFlowKind';
import { AssociationDirectionKind } from '../../model/bpmn/internal/edge/AssociationDirectionKind';
import { AssociationFlow, MessageFlow, SequenceFlow } from '../../model/bpmn/internal/edge/Flow';
import { MessageVisibleKind } from '../../model/bpmn/internal/edge/MessageVisibleKind';

export interface BpmnG6NodeConfig extends NodeConfig {
  bpmn: {
    eventKind?: ShapeBpmnEventKind;
    isInterrupting?: boolean;
    subProcessKind?: ShapeBpmnSubProcessKind;
    instantiate?: boolean;
    markers?: ShapeBpmnMarkerKind[];
    isHorizontal?: boolean;
    gatewayKind?: ShapeBpmnEventBasedGatewayKind;
  };
  fontWeight?: string;
  fontFamily?: string;
  textDecoration?: string;
}

export interface BpmnG6EdgeConfig extends EdgeConfig {
  bpmn?: {
    sequenceFlowKind?: SequenceFlowKind;
    associationDirectionKind?: AssociationDirectionKind;
    messageVisibleKind?: boolean;
  };
  fontWeight?: string;
  fontFamily?: string;
  textDecoration?: string;
}

export default class G6Renderer {
  constructor(
    readonly graph: Graph, // , readonly coordinatesTranslator: CoordinatesTranslator, readonly styleConfigurator: StyleConfigurator
  ) {}

  public render(bpmnModel: BpmnModel, loadOptions?: LoadOptions): void {
    this.insertNodesAndEdges(bpmnModel);
    // this.graph.customFit(loadOptions?.fit);
  }

  private insertNodesAndEdges(bpmnModel: BpmnModel): void {
    const displayedModel = toDisplayedModel(bpmnModel);

    const data: GraphData = { nodes: [], edges: [], combos: [] };

    data.nodes = data.nodes.concat(this.convertToNodes(displayedModel.pools));
    data.nodes = data.nodes.concat(this.convertToNodes(displayedModel.lanes));
    data.nodes = data.nodes.concat(this.convertToNodes(displayedModel.subprocesses));
    data.nodes = data.nodes.concat(this.convertToNodes(displayedModel.otherFlowNodes));
    // last shape as the boundary event parent must be in the model (subprocess or activity)
    data.nodes = data.nodes.concat(this.convertToNodes(displayedModel.boundaryEvents));

    // at last as edge source and target must be present in the model prior insertion, otherwise they are not rendered
    data.edges = data.edges.concat(this.convertToEdges(displayedModel.edges));

    this.graph.data(data);
    this.graph.render();
  }

  private convertToNodes(shapes: Shape[]): BpmnG6NodeConfig[] {
    return shapes.map(shape => this.insertShape(shape));
  }

  /*  private getParent(bpmnElement: ShapeBpmnElement): mxCell {
    const bpmnElementParent = this.getCell(bpmnElement.parentId);
    if (bpmnElementParent) {
      return bpmnElementParent;
    }

    if (!ShapeUtil.isBoundaryEvent(bpmnElement.kind)) {
      return this.graph.getDefaultParent();
    }
  }*/

  private insertShape(shape: Shape): BpmnG6NodeConfig {
    const bpmnElement = shape.bpmnElement;
    if (bpmnElement) {
      /*      const parent = this.getParent(bpmnElement);
      if (!parent) {
        // TODO error management
        console.warn('Not possible to insert shape %s: parent cell %s is not found', bpmnElement.id, bpmnElement.parentId);
        return;
      }
     */

      const bounds = shape.bounds;
      const kind = bpmnElement.kind;

      const node: BpmnG6NodeConfig = {
        id: bpmnElement.id,
        type: kind,
        label: bpmnElement.name,
        x: bounds.x,
        y: bounds.y,
        size: [shape.bounds.width, shape.bounds.height],
        anchorPoints: [
          [0, 0.5],
          [1, 0.5],
        ],
        bpmn: {},
      };

      const bpmnCfg = node.bpmn;
      if (bpmnElement instanceof ShapeBpmnEvent) {
        bpmnCfg.eventKind = bpmnElement.eventKind;

        if (bpmnElement instanceof ShapeBpmnBoundaryEvent || (bpmnElement instanceof ShapeBpmnStartEvent && bpmnElement.isInterrupting !== undefined)) {
          bpmnCfg.isInterrupting = bpmnElement.isInterrupting;
        }
      } else if (bpmnElement instanceof ShapeBpmnActivity) {
        if (bpmnElement instanceof ShapeBpmnSubProcess) {
          bpmnCfg.subProcessKind = bpmnElement.subProcessKind;
        } else if (bpmnElement.kind === ShapeBpmnElementKind.TASK_RECEIVE) {
          bpmnCfg.instantiate = bpmnElement.instantiate;
        }

        bpmnCfg.markers = bpmnElement.markers;
      } else if (ShapeUtil.isPoolOrLane((bpmnElement as ShapeBpmnElement).kind)) {
        // mxConstants.STYLE_HORIZONTAL is for the label
        // In BPMN, isHorizontal is for the Shape
        bpmnCfg.isHorizontal = shape.isHorizontal;
      } else if (bpmnElement instanceof ShapeBpmnEventBasedGateway) {
        bpmnCfg.instantiate = bpmnElement.instantiate;
        bpmnCfg.gatewayKind = bpmnElement.gatewayKind;
      }

      const label = shape.label;
      if (label) {
        const labelBounds = label.bounds;
        /*    // pool/lane label bounds are not managed for now (use hard coded values)
      labelBounds = ShapeUtil.isPoolOrLane(bpmnElement.kind) ? undefined : labelBounds; */

        node.labelCfg = { refX: labelBounds?.x, refY: labelBounds?.y };
        /*        if (!labelBounds?.x) {
          node.labelCfg.position = ShapeUtil.isEvent(kind) ? 'bottom' : ShapeUtil.isActivity(kind) ? 'middle' : 'top';
        }*/

        const font = label.font;
        if (font) {
          const fontStyle = font.isItalic ? 'italic' : 'normal';

          // G6 Text Shape properties
          node.fontWeight = font.isBold ? 'bold' : 'normal';
          node.fontFamily = font.name;

          let textDecoration = '';
          if (font.isStrikeThrough) {
            textDecoration = 'line-through ';
          }
          if (font.isUnderline) {
            textDecoration += 'underline';
          }
          node.textDecoration = textDecoration;

          node.labelCfg.style = { fontSize: font.size, fontStyle };
        }
      }

      /*
      if (labelBounds) {
        styleValues.set(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_TOP);
        if (bpmnCell.bpmnElement.kind != ShapeBpmnElementKind.TEXT_ANNOTATION) {
          styleValues.set(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
        }

        if (bpmnCell instanceof Shape) {
          // arbitrarily increase width to relax too small bounds (for instance for reference diagrams from miwg-test-suite)
          styleValues.set(mxConstants.STYLE_LABEL_WIDTH, labelBounds.width + 1);
          // align settings
          styleValues.set(mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_TOP);
          styleValues.set(mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_LEFT);
        }
      }
      // when no label bounds, adjust the default style dynamically
      else if (
        bpmnCell instanceof Shape &&
        (bpmnElement instanceof ShapeBpmnSubProcess || bpmnElement instanceof ShapeBpmnCallActivity) &&
        !bpmnElement.markers.includes(ShapeBpmnMarkerKind.EXPAND)
      ) {
        styleValues.set(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_TOP);
      }*/

      return node;
    }
  }

  private convertToEdges(edges: Edge[]): BpmnG6EdgeConfig[] {
    return edges.map(edge => {
      const bpmnElement = edge.bpmnElement;
      if (bpmnElement) {
        /*        const parent = this.graph.getDefaultParent();
        const source = this.getCell(bpmnElement.sourceRefId);
        const target = this.getCell(bpmnElement.targetRefId);
        const labelBounds = edge.label?.bounds;
        const style = this.styleConfigurator.computeStyle(edge, labelBounds);
        const mxEdge = this.graph.insertEdge(parent, bpmnElement.id, bpmnElement.name, source, target, style);
        this.insertWaypoints(edge.waypoints, mxEdge);

        if (labelBounds) {
          mxEdge.geometry.width = labelBounds.width;
          mxEdge.geometry.height = labelBounds.height;

          const edgeCenterCoordinate = this.coordinatesTranslator.computeEdgeCenter(mxEdge);
          if (edgeCenterCoordinate) {
            mxEdge.geometry.relative = false;

            const labelBoundsRelativeCoordinateFromParent = this.coordinatesTranslator.computeRelativeCoordinates(mxEdge.parent, new mxPoint(labelBounds.x, labelBounds.y));
            const relativeLabelX = labelBoundsRelativeCoordinateFromParent.x + labelBounds.width / 2 - edgeCenterCoordinate.x;
            const relativeLabelY = labelBoundsRelativeCoordinateFromParent.y - edgeCenterCoordinate.y;
            mxEdge.geometry.offset = new mxPoint(relativeLabelX, relativeLabelY);
          }
        }

        this.insertMessageFlowIconIfNeeded(edge, mxEdge);*/

        const edgeConf: BpmnG6EdgeConfig = {
          id: edge.id,
          type: bpmnElement.kind,
          label: bpmnElement.name,
          source: bpmnElement.sourceRefId,
          target: bpmnElement.targetRefId,
          controlPoints: edge.waypoints as IPoint[],
          /*         sourceAnchor: 0,
          targetAnchor: 0,*/
        };
        if (bpmnElement instanceof SequenceFlow) {
          edgeConf.sequenceFlowKind = bpmnElement.sequenceFlowKind;
        } else if (bpmnElement instanceof AssociationFlow) {
          edgeConf.associationDirectionKind = bpmnElement.associationDirectionKind;
        } else if (edge.bpmnElement instanceof MessageFlow && edge.messageVisibleKind !== MessageVisibleKind.NONE) {
          edgeConf.messageVisibleKind = edge.messageVisibleKind;
        }

        const label = edge.label;
        if (label) {
          const labelBounds = label.bounds;
          /*    // pool/lane label bounds are not managed for now (use hard coded values)
        labelBounds = ShapeUtil.isPoolOrLane(bpmnElement.kind) ? undefined : labelBounds; */

          edgeConf.labelCfg = { refX: labelBounds?.x, refY: labelBounds?.y };

          const font = label.font;
          if (font) {
            const fontStyle = font.isItalic ? 'italic' : 'normal';

            // G6 Text Shape properties
            edgeConf.fontWeight = font.isBold ? 'bold' : 'normal';
            edgeConf.fontFamily = font.name;

            let textDecoration = '';
            if (font.isStrikeThrough) {
              textDecoration = 'line-through ';
            }
            if (font.isUnderline) {
              textDecoration += 'underline';
            }
            edgeConf.textDecoration = textDecoration;

            edgeConf.labelCfg.style = { fontSize: font.size, fontStyle };
          }
        }

        return edgeConf;
      }
    });

    /*    const font = bpmnCell.label?.font;
    if (font) {
      // styleValues.set(mxConstants.STYLE_FONTFAMILY, font.name);
      // styleValues.set(mxConstants.STYLE_FONTSIZE, font.size);
      // styleValues.set(mxConstants.STYLE_FONTSTYLE, StyleConfigurator.getFontStyleValue(font));
    }

    if (labelBounds) {
      // styleValues.set(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_TOP);
      if (bpmnCell.bpmnElement.kind != ShapeBpmnElementKind.TEXT_ANNOTATION) {
        // styleValues.set(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
      }
    }*/
  }

  /*  private insertMessageFlowIconIfNeeded(edge: Edge, mxEdge: mxCell): void {
    if (edge.bpmnElement instanceof MessageFlow && edge.messageVisibleKind !== MessageVisibleKind.NONE) {
      const mxCell = this.graph.insertVertex(mxEdge, `messageFlowIcon_of_${mxEdge.id}`, undefined, 0, 0, 20, 14, this.styleConfigurator.computeMessageFlowIconStyle(edge));
      mxCell.geometry.relative = true;
      mxCell.geometry.offset = new mxPoint(-10, -7);
    }
  }

  private insertWaypoints(waypoints: Waypoint[], mxEdge: mxCell): void {
    if (waypoints) {
      mxEdge.geometry.points = waypoints.map(waypoint => {
        return this.coordinatesTranslator.computeRelativeCoordinates(mxEdge.parent, new mxPoint(waypoint.x, waypoint.y));
      });
    }
  }

  private getCell(id: string): mxCell {
    return this.graph.getModel().getCell(id);
  }

  private insertVertex(parent: mxCell, id: string | null, value: string, bounds: Bounds, labelBounds: Bounds, style?: string): mxCell {
    const vertexCoordinates = this.coordinatesTranslator.computeRelativeCoordinates(parent, new mxPoint(bounds.x, bounds.y));
    const mxCell = this.graph.insertVertex(parent, id, value, vertexCoordinates.x, vertexCoordinates.y, bounds.width, bounds.height, style);

    if (labelBounds) {
      // label coordinates are relative in the cell referential coordinates
      const relativeLabelX = labelBounds.x - bounds.x;
      const relativeLabelY = labelBounds.y - bounds.y;
      mxCell.geometry.offset = new mxPoint(relativeLabelX, relativeLabelY);
    }
    return mxCell;
  }*/
}

export function defaultG6Renderer(graph: Graph): G6Renderer {
  return new G6Renderer(
    graph,
    // , new CoordinatesTranslator(graph), new StyleConfigurator(graph)
  );
}

function toDisplayedModel(bpmnModel: BpmnModel): DisplayedModel {
  const collapsedSubProcessIds: string[] = bpmnModel.flowNodes
    .filter(shape => {
      const bpmnElement = shape.bpmnElement;
      return ShapeUtil.isSubProcess(bpmnElement?.kind) && (bpmnElement as ShapeBpmnSubProcess)?.markers.includes(ShapeBpmnMarkerKind.EXPAND);
    })
    .map(shape => shape.bpmnElement?.id);

  const subprocesses: Shape[] = [];
  const boundaryEvents: Shape[] = [];
  const otherFlowNodes: Shape[] = [];
  bpmnModel.flowNodes.forEach(shape => {
    const kind = shape.bpmnElement?.kind;
    if (ShapeUtil.isSubProcess(kind)) {
      subprocesses.push(shape);
    } else if (ShapeUtil.isBoundaryEvent(kind)) {
      boundaryEvents.push(shape);
    } else if (!collapsedSubProcessIds.includes(shape.bpmnElement?.parentId)) {
      otherFlowNodes.push(shape);
    }
  });

  return { boundaryEvents: boundaryEvents, edges: bpmnModel.edges, lanes: bpmnModel.lanes, otherFlowNodes: otherFlowNodes, pools: bpmnModel.pools, subprocesses: subprocesses };
}

interface DisplayedModel {
  edges: Edge[];
  boundaryEvents: Shape[];
  otherFlowNodes: Shape[];
  lanes: Shape[];
  pools: Shape[];
  subprocesses: Shape[];
}

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
import { ensureIsArray } from '../helpers/array-utils';
import { computeBpmnBaseClassName, extractBpmnKindFromStyle } from '../mxgraph/style-helper';
import { FlowKind } from '../../model/bpmn/internal/edge/FlowKind';
import { ShapeBpmnElementKind } from '../../model/bpmn/internal/shape';
import { CssRegistry } from './css-registry';
import { StyleIdentifier } from '../mxgraph/StyleUtils';
import { Graph } from '@antv/g6';
import { Item } from '@antv/g6/lib/types';

export function newBpmnElementsRegistry(graph: Graph): BpmnElementsRegistry {
  return new BpmnElementsRegistry(new BpmnModelRegistry(graph), new HtmlElementRegistry(new BpmnQuerySelectors(graph.getContainer()?.id)), new CssRegistry());
}

/**
 * @experimental subject to change, feedback welcome.
 *
 * > BpmnElementRegistry is a public API that permits to find the BpmnElements present in the diagram.
 * > How to access it:
 *
 * ```javascript
 * // 1. Initialize the BpmnVisualization.
 * const bpmnVisualization = new bpmnvisu.BpmnVisualization(document.getElementById('bpmn-container'));
 * // 2. Get diagram and load it.
 * const bpmn = 'BPMN diagram string - whether coming from bpmn.xml file or some API call';
 * bpmnVisualization.load(bpmn);
 * // 3. Access registry directly from bpmnVisualization.
 * bpmnVisualization.bpmnElementsRegistry
 * ```
 */
export class BpmnElementsRegistry {
  /**
   * @internal
   */
  constructor(private bpmnModelRegistry: BpmnModelRegistry, private htmlElementRegistry: HtmlElementRegistry, private cssRegistry: CssRegistry) {}

  // TODO doc, not found elements are not present in the return array
  /**
   * Get all elements by ids.
   *
   * ```javascript
   * ...
   * // Find all elements by specified id or ids
   * const bpmnElementsSet1 = bpmnVisualization.bpmnElementsRegistry.getElementsByIds('userTask_1');
   * const bpmnElementsSet2 = bpmnVisualization.bpmnElementsRegistry.getElementsByIds(['startEvent_3', 'userTask_2']);
   * // now you can do whatever you want with the elements
   * ...
   * ```
   */
  getElementsByIds(bpmnElementIds: string | string[]): BpmnElement[] {
    return ensureIsArray<string>(bpmnElementIds)
      .map(id => this.bpmnModelRegistry.getBpmnSemantic(id))
      .filter(e => e)
      .map(bpmnSemantic => ({ bpmnSemantic: bpmnSemantic, htmlElement: this.htmlElementRegistry.getBpmnHtmlElement(bpmnSemantic.id) }));
  }

  /**
   * Get all elements by kinds.
   *
   * ```javascript
   * ...
   * // Find all elements by desired type or types
   * const bpmnTaskElements = bpmnVisualization.bpmnElementsRegistry.getElementsByKinds(bpmnvisu.ShapeBpmnElementKind.TASK);
   * const bpmnEndEventAndPoolElements = bpmnVisualization.bpmnElementsRegistry.getElementsByKinds([bpmnvisu.ShapeBpmnElementKind.EVENT_END, bpmnvisu.ShapeBpmnElementKind.POOL]);
   * // now you can do whatever you want with the elements
   * ...
   * ```
   */
  getElementsByKinds(bpmnKinds: BpmnElementKind | BpmnElementKind[]): BpmnElement[] {
    const bpmnElements: BpmnElement[] = [];
    ensureIsArray<BpmnElementKind>(bpmnKinds)
      .map(kind =>
        // TODO when implementing #953, use the model to search for Bpmn elements matching kinds instead of css selectors
        this.htmlElementRegistry.getBpmnHtmlElements(kind).map(
          htmlElement =>
            ({
              htmlElement: htmlElement,
              bpmnSemantic: this.bpmnModelRegistry.getBpmnSemantic(htmlElement.getAttribute('data-bpmn-id')),
            } as BpmnElement),
        ),
      )
      // We will be able to use flatmap instead when targeting es2019+
      .forEach(innerBpmnElements => bpmnElements.push(...innerBpmnElements));

    return bpmnElements;
  }

  /**
   * Add one/several CSS class(es) to one/several BPMN element(s)
   *
   * @param bpmnElementIds The BPMN id of the element(s) where to add the CSS classes
   * @param classNames The name of the class(es) to add to the BPMN element(s)
   */
  addCssClasses(bpmnElementIds: string | string[], classNames: string | string[]): void {
    const arrayClassNames = ensureIsArray<string>(classNames);
    ensureIsArray<string>(bpmnElementIds).forEach(bpmnElementId => {
      this.cssRegistry.addClassNames(bpmnElementId, arrayClassNames);
      this.bpmnModelRegistry.refreshCell(bpmnElementId, this.cssRegistry);
    });
  }
}

export type BpmnElementKind = FlowKind | ShapeBpmnElementKind;

export interface BpmnSemantic {
  id: string;
  name: string;
  /** `true` when relates to a BPMN Shape, `false` when relates to a BPMN Edge. */
  isShape: boolean;
  // TODO use a more 'type oriented' BpmnElementKind (as part of #929)
  kind: string;
}

export interface BpmnElement {
  bpmnSemantic: BpmnSemantic;
  htmlElement: HTMLElement;
}

// for now, we don't store the BpmnModel so we can use it, information are only available in the mxgraph model
class BpmnModelRegistry {
  constructor(private graph: Graph) {}

  getBpmnSemantic(bpmnElementId: string): BpmnSemantic | undefined {
    const item: Item = this.graph.findById(bpmnElementId);
    if (item == null) {
      return undefined;
    }

    return { id: bpmnElementId, name: item.getModel().label as string, isShape: item.getType() === ('node' || 'combo'), kind: extractBpmnKindFromStyle(item) };
  }

  // TODO move to a dedicated class in charge of updating the mxgraph/rendered model
  refreshCell(bpmnElementId: string, cssRegistry: CssRegistry): void {
    const item = this.graph.findById(bpmnElementId);
    // cssRegistry.getClassNames(bpmnElementId).join(' ')

    this.graph.updateItem(bpmnElementId, { style: {} });
  }
}

/**
 * Once mxGraph is initialized at BpmnVisualization construction, prior loading a BPMN diagram, the DOM looks like:
 * ```html
 * <div id="bpmn-container" style="touch-action: none;">
 *   <svg style="left: 0px; top: 0px; width: 100%; height: 100%; display: block; min-width: 1px; min-height: 1px;">
 *     <g>
 *       <g></g>
 *       <g></g>
 *       <g></g>
 *       <g></g>
 *     </g>
 *   </svg>
 * </div>
 * ```
 *
 * After loading, the DOM looks like:
 * ```html
 * <div id="bpmn-container" style="touch-action: none;">
 *   <svg style="left: 0px; top: 0px; width: 100%; height: 100%; display: block; min-width: 900px; min-height: 181px;">
 *     <g>
 *       <g></g>
 *       <g>
 *         <g style="" class="bpmn-pool" data-bpmn-id="Participant_1">....</g>
 *       </g>
 *       <g></g>
 *       <g></g>
 *     </g>
 *   </svg>
 * </div>
 * ```
 * In the 2nd 'g' node, children 'g' nodes with the 'data-cell-id' attribute (extra attribute generated by the lib) are only available when the rendering is done
 */
export class BpmnQuerySelectors {
  constructor(private containerId: string) {}

  // TODO do we make explicit that this selector targets a SVG group?
  existingElement(): string {
    return `#${this.containerId} > svg > g > g > g[data-bpmn-id]`;
  }

  element(bpmnElementId: string): string {
    // TODO use more precise selector (use child combinator)
    return `#${this.containerId} svg g g[data-bpmn-id="${bpmnElementId}"]`;
  }

  labelOfElement(bpmnElementId?: string): string {
    return `#${this.containerId} > svg > g > g > g[data-bpmn-id="${bpmnElementId}"].bpmn-label > g > foreignObject`;
  }

  elementsOfKind(bpmnKindCssClassname: string): string {
    return `#${this.containerId} > svg > g > g > g.${bpmnKindCssClassname}:not(.bpmn-label)`;
  }
}

class HtmlElementRegistry {
  constructor(private selectors: BpmnQuerySelectors) {}

  /**
   * Returns `null` if no element is found.
   * @param bpmnElementId the id of the BPMN element represented by the searched Html Element.
   */
  getBpmnHtmlElement(bpmnElementId: string): HTMLElement | null {
    // TODO error management, for now we return null
    return document.querySelector<HTMLElement>(this.selectors.element(bpmnElementId));
  }

  getBpmnHtmlElements(bpmnElementKind: BpmnElementKind): HTMLElement[] {
    const selectors = this.selectors.elementsOfKind(computeBpmnBaseClassName(bpmnElementKind));
    return [...document.querySelectorAll<HTMLElement>(selectors)];
  }
}

/**
 * Copyright 2021 Bonitasoft S.A.
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
import { CssRegistry } from '../../../../src/component/registry/css-registry';

let cssRegistry: CssRegistry;
beforeEach(() => {
  cssRegistry = new CssRegistry();
});

describe('manage css classes for BPMN cells', () => {
  describe('Get css classes', () => {
    it('getClassNames should return a empty array, when no class name is registered for the BPMN element', () => {
      cssRegistry.addClassNames('bpmn-id-1', ['class-name']);
      expect(cssRegistry.getClassNames('bpmn-id-2')).toHaveLength(0);
    });
  });

  describe('Add css classes', () => {
    it('1 class name should be registered, when add it for the first time', () => {
      const bpmnElementId = 'bpmn-id';
      const classNames = ['class-name'];

      cssRegistry.addClassNames(bpmnElementId, classNames);

      expect(cssRegistry.getClassNames(bpmnElementId)).toEqual(classNames);
    });

    it('2 class names should be registered, when add them for the first time', () => {
      const bpmnElementId = 'bpmn-id';
      const classNames = ['class-name-1', 'class-name-2'];

      cssRegistry.addClassNames(bpmnElementId, classNames);

      expect(cssRegistry.getClassNames(bpmnElementId)).toEqual(classNames);
    });

    it('a class name should be registered only once, when add it twice', () => {
      const bpmnElementId = 'bpmn-id';
      cssRegistry.addClassNames(bpmnElementId, ['class-name-1', 'class-name-2']);

      cssRegistry.addClassNames(bpmnElementId, ['class-name-3', 'class-name-2', 'class-name-4']);

      expect(cssRegistry.getClassNames(bpmnElementId)).toEqual(['class-name-1', 'class-name-2', 'class-name-3', 'class-name-4']);
    });
  });

  describe('Remove css classes', () => {
    it('Remove the only existing class', () => {
      const bpmnElementId = 'bpmn-id';
      cssRegistry.addClassNames(bpmnElementId, ['class-to-remove']);
      expect(cssRegistry.removeClassNames(bpmnElementId, ['class-to-remove'])).toBeTruthy();
      expect(cssRegistry.getClassNames(bpmnElementId)).toHaveLength(0);
    });

    it('Remove a single class when several exist', () => {
      const bpmnElementId = 'bpmn-id';
      cssRegistry.addClassNames(bpmnElementId, ['class1', 'class-to-remove', 'class2']);
      expect(cssRegistry.removeClassNames(bpmnElementId, ['class-to-remove'])).toBeTruthy();
      expect(cssRegistry.getClassNames(bpmnElementId)).toEqual(['class1', 'class2']);
    });

    it('Remove several classes when several exist', () => {
      const bpmnElementId = 'bpmn-id';
      cssRegistry.addClassNames(bpmnElementId, ['class1', 'class-to-remove1', 'class2', 'class-to-remove2']);
      expect(cssRegistry.removeClassNames(bpmnElementId, ['class-to-remove1', 'class-to-remove2'])).toBeTruthy();
      expect(cssRegistry.getClassNames(bpmnElementId)).toEqual(['class1', 'class2']);
    });

    it('Remove a class when none had been added first', () => {
      const bpmnElementId = 'bpmn-id';
      expect(cssRegistry.removeClassNames(bpmnElementId, ['class-to-remove'])).toBeFalsy();
      expect(cssRegistry.getClassNames(bpmnElementId)).toHaveLength(0);
    });

    it('Remove a class that is not present when others have been added first', () => {
      const bpmnElementId = 'bpmn-id';
      cssRegistry.addClassNames(bpmnElementId, ['class1', 'class2']);
      expect(cssRegistry.removeClassNames(bpmnElementId, ['class-to-remove'])).toBeFalsy();
      expect(cssRegistry.getClassNames(bpmnElementId)).toEqual(['class1', 'class2']);
    });

    it('Remove a class twice', () => {
      const bpmnElementId = 'bpmn-id';
      cssRegistry.addClassNames(bpmnElementId, ['class-to-remove']);
      let removed = cssRegistry.removeClassNames(bpmnElementId, ['class-to-remove']);
      expect(removed).toBeTruthy();
      removed = cssRegistry.removeClassNames(bpmnElementId, ['class-to-remove']);
      expect(removed).toBeFalsy();
      expect(cssRegistry.getClassNames(bpmnElementId)).toHaveLength(0);
    });
  });
});

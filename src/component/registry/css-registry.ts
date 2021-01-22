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
export class CssRegistry {
  // TODO using a Set internally will prevent multi transformation (only when getting the class list)
  private classNamesByBPMNId = new Map<string, string[]>();

  getClassNames(bpmnElementId: string): string[] {
    return this.classNamesByBPMNId.get(bpmnElementId) || [];
  }

  addClassNames(bpmnElementId: string, classNames: string[]): void {
    // TODO: return the real modified id

    const existingClassNames = this.classNamesByBPMNId.get(bpmnElementId);
    const setClassNames = !existingClassNames
      ? classNames
      : // To avoid duplicated classes
        Array.from(new Set(existingClassNames.concat(classNames)));
    this.classNamesByBPMNId.set(bpmnElementId, setClassNames);
  }

  // return `true` if at least one class has been removed
  removeClassNames(bpmnElementId: string, classNames: string[]): boolean {
    const existingClassNames = this.classNamesByBPMNId.get(bpmnElementId);
    const remainingClasses = new Set(existingClassNames);

    let removed = false;
    classNames.forEach(c => (removed = remainingClasses.delete(c) || removed));

    this.classNamesByBPMNId.set(bpmnElementId, Array.from(remainingClasses));
    return removed;
  }
}

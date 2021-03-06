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

/**
 * Options to configure `bpmn-visualization` at initialization.
 */
export interface GlobalOptions {
  /** The id of a DOM element or an HTML node where the BPMN diagram is rendered. */
  container: string | HTMLElement;
  /** Control the BPMN diagram navigation i.e. panning and zoom. */
  navigation?: NavigationConfiguration;
}

export interface NavigationConfiguration {
  /**
   * @default false
   */
  enabled: boolean;
  /** Tune how the zoom behaves when using the mouse wheel or with gesture/pinch on touch devices. */
  zoom: ZoomConfiguration;
}

/**
 * Zoom specific options.
 */
export interface ZoomConfiguration {
  /**
   * throttleDelay [ms] responsible for throttling the mouse scroll event (not every event is firing the function handler, only limited number can lunch handler). A smaller value
   * results in more events fired, bigger gain in zoom factor.
   * Values must be in the [0, 100] interval, values outside of this interval are set to the interval bounds.
   * @default 50
   */
  throttleDelay?: number;
  /**
   * debounceDelay [ms] responsible for debouncing the zoom function - the actual scaling. A bigger value results in bigger gain in zoom factor before actual scaling takes place.
   * Values must be in the [0, 100] interval, values outside of this interval are set to the interval bounds.
   * @default 50
   */
  debounceDelay?: number;
}

/**
 * Options when loading a BPMN Diagram.
 */
export interface LoadOptions {
  fit?: FitOptions;
}

export interface FitOptions {
  type?: FitType; // TODO mandatory?
  /**
   * Negative values fallback to default.
   * @default 0 */
  margin?: number;
}

/**
 * @default {@link FitType.None}
 */
export enum FitType {
  /** No fit, use dimensions and coordinates from the BPMN diagram. */
  None = 'None',
  /** Fit the whole html container available to render the BPMN diagram. */
  HorizontalVertical = 'HorizontalVertical',
  /** Fit only horizontally. */
  Horizontal = 'Horizontal',
  /** Fit only vertically. */
  Vertical = 'Vertical',
  /** Fit and center the BPMN Diagram. */
  Center = 'Center',
}

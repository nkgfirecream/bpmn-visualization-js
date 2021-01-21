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
import BpmnVisualization from '../component/BpmnVisualization';
import { GlobalOptions, FitOptions, FitType, LoadOptions } from '../component/options';
import { log, logStartup } from './helper';
import { DropFileUserInterface } from './component/DropFileUserInterface';
import { BpmnElement, BpmnElementKind } from '../component/registry/bpmn-elements-registry';
import CytoBpmnVisualization from '../component/CytoBpmnVisualization';

export * from './helper';

let bpmnVisualization: BpmnVisualization;
let loadOptions: LoadOptions = {};
let cytoBpmnVisualization: CytoBpmnVisualization;

export function updateLoadOptions(fitOptions: FitOptions): void {
  log('Updating load options', fitOptions);
  loadOptions.fit = fitOptions;
  log('Load options updated!', stringify(loadOptions));
}

/**
 * Returns a copy
 */
export function getCurrentLoadOptions(): LoadOptions {
  return { ...loadOptions };
}

function stringify(value: unknown): string {
  return JSON.stringify(value, undefined, 2);
}

function loadBpmn(bpmn: string): void {
  log('Loading bpmn....');
  bpmnVisualization.load(bpmn, loadOptions);
  log('BPMN loaded with configuration', stringify(loadOptions));
}

export function fit(fitOptions: FitOptions): void {
  log('Fitting....');
  bpmnVisualization.fit(fitOptions);
  log('Fit done with configuration', stringify(fitOptions));
}

export function getElementsByKinds(bpmnKinds: BpmnElementKind | BpmnElementKind[]): BpmnElement[] {
  return bpmnVisualization.bpmnElementsRegistry.getElementsByKinds(bpmnKinds);
}

function loadBpmnCyto(bpmn: string): void {
  log('Loading bpmn....');
  cytoBpmnVisualization.load(bpmn);
  log('BPMN loaded');
}

// callback function for opening | dropping the file to be loaded
function readAndLoadFile(f: File): void {
  const reader = new FileReader();
  reader.onload = () => {
    loadBpmn(reader.result as string);
  };
  reader.readAsText(f);
}
function readAndLoadFileCyto(f: File): void {
  const reader = new FileReader();
  reader.onload = () => {
    loadBpmnCyto(reader.result as string);
  };
  reader.readAsText(f);
}

/**
 * <b>IMPORTANT</b>: be sure to have call the `startBpmnVisualization` function prior calling this function as it relies on resources that must be initialized first.
 */
// TODO: make File Open Button a self contained component
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function handleFileSelect(evt: any): void {
  const f = evt.target.files[0];
  readAndLoadFile(f);
}
export function handleFileSelectCyto(evt: any): void {
  const f = evt.target.files[0];
  readAndLoadFileCyto(f);
}

function fetchBpmnContent(url: string): Promise<string> {
  log(`Fetching BPMN content from url ${url}`);
  return fetch(url).then(response => {
    if (!response.ok) {
      throw Error(String(response.status));
    }
    return response.text();
  });
}

function loadBpmnFromUrl(url: string, statusFetchKoNotifier: (errorMsg: string) => void): void {
  fetchBpmnContent(url)
    .catch(error => {
      const errorMessage = `Unable to fetch ${url}. ${error}`;
      statusFetchKoNotifier(errorMessage);
      throw new Error(errorMessage);
    })
    .then(responseBody => {
      log('BPMN content fetched');
      return responseBody;
    })
    .then(bpmn => {
      loadBpmn(bpmn);
      log(`Bpmn loaded from url ${url}`);
    });
}

export interface BpmnVisualizationDemoConfiguration {
  statusFetchKoNotifier?: (errorMsg: string) => void;
  globalOptions: GlobalOptions;
  loadOptions?: LoadOptions;
}

function defaultStatusFetchKoNotifier(errorMsg: string): void {
  console.error(errorMsg);
}

function getFitOptionsFromParameters(config: BpmnVisualizationDemoConfiguration, parameters: URLSearchParams): FitOptions {
  const fitOptions: FitOptions = config.loadOptions?.fit || {};
  const parameterFitType: string = parameters.get('fitTypeOnLoad');
  if (parameterFitType) {
    // As the parameter is a string, and the load/fit APIs accept only enum to avoid error, we need to convert it
    fitOptions.type = <FitType>parameterFitType;
  }
  const parameterFitMargin = parameters.get('fitMargin');
  if (parameterFitMargin) {
    fitOptions.margin = Number(parameterFitMargin);
  }
  return fitOptions;
}

export function startBpmnVisualization(config: BpmnVisualizationDemoConfiguration): void {
  const log = logStartup;
  const container = config.globalOptions.container;

  log(`Initializing BpmnVisualization with container '${container}'...`);
  bpmnVisualization = new BpmnVisualization(config.globalOptions);
  log('Initialization completed');
  new DropFileUserInterface(window, 'drop-container', container as string, readAndLoadFile);
  log('Drag&Drop support initialized');

  const parameters = new URLSearchParams(window.location.search);

  log('Configuring Load Options');
  loadOptions = config.loadOptions || {};
  loadOptions.fit = getFitOptionsFromParameters(config, parameters);

  log("Checking if 'BPMN content' is provided as query parameter");
  const bpmnParameterValue = parameters.get('bpmn');
  if (bpmnParameterValue) {
    const bpmn = decodeURIComponent(bpmnParameterValue);
    log(`Received bpmn length: ${bpmn.length}`);
    log(`Received bpmn content: ${bpmn}`);
    log('BPMN auto loading');
    loadBpmn(bpmn);
    log('BPMN content loading completed');
    return;
  }
  log("No 'BPMN content' provided");

  log("Checking if an 'url to fetch BPMN content' is provided as query parameter");
  const urlParameterValue = parameters.get('url');
  if (urlParameterValue) {
    const url = decodeURIComponent(urlParameterValue);
    const statusFetchKoNotifier = config.statusFetchKoNotifier || defaultStatusFetchKoNotifier;
    loadBpmnFromUrl(url, statusFetchKoNotifier);
    return;
  }
  log("No 'url to fetch BPMN content' provided");
}

export function initCytoBpmnVisualization(containerId: string): void {
  const log = logStartup;

  log(`Initializing BpmnVisualization with container '${containerId}'...`);
  cytoBpmnVisualization = new CytoBpmnVisualization(containerId);
}

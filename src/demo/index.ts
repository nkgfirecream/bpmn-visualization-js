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
import { BpmnVisualizationOptions, FitType, LoadOptions } from '../component/Options';
import { log, logStartup } from './helper';
import { DropFileUserInterface } from './component/DropFileUserInterface';
import CytoBpmnVisualization from '../component/CytoBpmnVisualization';

export * from './helper';

let bpmnVisualization: BpmnVisualization;
let loadOptions: LoadOptions = {};
let cytoBpmnVisualization: CytoBpmnVisualization;

export function updateFitConfig(config: { type?: string; margin?: number }): void {
  log('Updating fit config', config);

  loadOptions.fit.margin = config.margin || loadOptions.fit.margin;
  if (config.type) {
    loadOptions.fit.type = FitType[config.type as keyof typeof FitType];
  }
  log('Fit config updated!', loadOptions.fit);
}

/**
 * Returns a copy
 */
export function getCurrentLoadOptions(): LoadOptions {
  return { ...loadOptions };
}

function loadBpmn(bpmn: string): void {
  log('Loading bpmn....');
  bpmnVisualization.load(bpmn, loadOptions);
  log('BPMN loaded');
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
  container: string;
  statusFetchKoNotifier?: (errorMsg: string) => void;
  globalOptions?: BpmnVisualizationOptions;
  loadOptions?: LoadOptions;
}

function defaultStatusFetchKoNotifier(errorMsg: string): void {
  console.error(errorMsg);
}

export function startBpmnVisualization(config: BpmnVisualizationDemoConfiguration): void {
  const log = logStartup;
  const container = config.container;

  log(`Initializing BpmnVisualization with container '${container}'...`);
  bpmnVisualization = new BpmnVisualization(window.document.getElementById(container), config.globalOptions);
  log('Initialization completed');
  new DropFileUserInterface(window, 'drop-container', container, readAndLoadFile);
  log('Drag&Drop support initialized');

  const parameters = new URLSearchParams(window.location.search);

  log('Configuring Load Options');
  loadOptions = config.loadOptions || {};
  loadOptions.fit ??= {};
  const parameterFitType = parameters.get('fitType');
  if (parameterFitType) {
    loadOptions.fit.type = FitType[parameterFitType as keyof typeof FitType];
  }
  const parameterFitMargin = parameters.get('fitMargin');
  if (parameterFitMargin) {
    loadOptions.fit.margin = Number(parameterFitMargin);
  }
  log(`Load Options: ${JSON.stringify(loadOptions, undefined, 2)}`);

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

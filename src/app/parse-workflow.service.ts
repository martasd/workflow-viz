import { Injectable } from '@angular/core';
import { Element, ElementCompact, xml2js, xml2json } from 'xml-js';

/**
 * Parse XML Workflow descriptor.
 */
@Injectable({
  providedIn: 'root'
})
export class ParseWorkflowService {
  json: string;
  js: Element | ElementCompact;

  constructor() {}

  /**
   * Converts xml string from wfd xml file to json.
   *
   * @param xml xml wfd string read from
   * @returns json string
   */
  toJson(xml: string): string {
    this.json = xml2json(xml, { compact: true, spaces: 4 });
    return this.json;
  }

  /**
   * Converts xml string from wfd xml file to js object.
   *
   * @param xml xml wfd string
   * @returns  js object
   */
  toJs(xml: string): Element | ElementCompact {
    this.js = xml2js(xml);
    return this.js;
  }
}

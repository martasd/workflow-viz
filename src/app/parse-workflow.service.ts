import { Injectable } from '@angular/core';
import { Element, ElementCompact, xml2js, xml2json } from 'xml-js';

@Injectable({
  providedIn: 'root'
})
export class ParseWorkflowService {
  json: string;
  js: Element | ElementCompact;

  constructor() {}

  toJson(xml: string) {
    this.json = xml2json(xml, { compact: true, spaces: 4 });
    console.log(this.json);
  }

  toJs(xml: string) {
    this.js = xml2js(xml);
    console.log(this.js);
  }
}

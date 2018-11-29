import { Injectable } from '@angular/core';
import * as xmljs from 'xml-js'

@Injectable({
  providedIn: 'root'
})
export class ParseWorkflowService {

  json: string;

  constructor() {
  }

  toJson(xml: string) {
    this.json = xmljs.xml2json(xml, { compact: true, spaces: 4 });
    console.log(this.json);
  }


}

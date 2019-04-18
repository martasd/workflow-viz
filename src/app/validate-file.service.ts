import { Injectable } from '@angular/core';
import * as parser from 'fast-xml-parser';
import { Element } from 'xml-js';
import { CreateSvgService } from './create-svg.service';

/**
 * Validate upload workflow file.
 */
@Injectable({
  providedIn: 'root'
})
export class ValidateFileService {
  constructor(private createSvgService: CreateSvgService) {}

  /**
   * Validate whether string is a valid XML and display appropriate error message.
   *
   * @param xmlString String read from input file
   * @returns Whether xml is valid or not
   */
  validateXML(xmlString: string): boolean {
    let xmlValid: true | parser.ValidationError;

    xmlValid = parser.validate(xmlString);

    if (xmlValid !== true) {
      this.createSvgService.createAlert(
        'Selected file contains invalid XML content!'
      );
      return false;
    }
    return true;
  }

  /**
   * Validates whether xml string contains a workflow.
   *
   * @param xmlString String read from input file
   * @returns Whether xml contains a workflow or not
   */
  validateWorkflow(workflowObj: Element): boolean {
    let workflowValid: Element;

    workflowValid = workflowObj.elements.find(element => {
      return element.name === 'workflow';
    });

    if (workflowValid === undefined) {
      this.createSvgService.createAlert(
        'Selected XML file does not contain a workflow!'
      );
      return false;
    }
    return true;
  }
}

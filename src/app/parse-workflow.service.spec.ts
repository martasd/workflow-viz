import { TestBed } from '@angular/core/testing';

import { ParseWorkflowService } from './parse-workflow.service';

describe('ParseWorkflowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ParseWorkflowService = TestBed.get(ParseWorkflowService);
    expect(service).toBeTruthy();
  });
});

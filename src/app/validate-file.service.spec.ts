import { TestBed } from '@angular/core/testing';

import { ValidateFileService } from './validate-file.service';

describe('ValidateFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ValidateFileService = TestBed.get(ValidateFileService);
    expect(service).toBeTruthy();
  });
});

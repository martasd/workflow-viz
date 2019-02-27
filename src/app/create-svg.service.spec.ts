/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CreateSvgService } from './create-svg.service';

describe('Service: CreateSvg', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateSvgService]
    });
  });

  it('should ...', inject([CreateSvgService], (service: CreateSvgService) => {
    expect(service).toBeTruthy();
  }));
});

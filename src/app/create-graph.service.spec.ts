/* tslint:disable:no-unused-variable */

import { async, inject, TestBed } from '@angular/core/testing';
import { CreateGraphService } from './create-graph.service';

describe('Service: CreateGraph', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateGraphService]
    });
  });

  it('should ...', inject(
    [CreateGraphService],
    (service: CreateGraphService) => {
      expect(service).toBeTruthy();
    }
  ));
});

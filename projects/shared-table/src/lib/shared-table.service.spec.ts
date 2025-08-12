import { TestBed } from '@angular/core/testing';

import { SharedTableService } from './shared-table.service';

describe('SharedTableService', () => {
  let service: SharedTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

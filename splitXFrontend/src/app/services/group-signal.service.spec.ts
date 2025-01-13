import { TestBed } from '@angular/core/testing';

import { GroupSignalService } from './group-signal.service';

describe('GroupSignalService', () => {
  let service: GroupSignalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupSignalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

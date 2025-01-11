import { TestBed } from '@angular/core/testing';

import { UserSignalService } from './user-signal.service';

describe('UserSignalService', () => {
  let service: UserSignalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSignalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

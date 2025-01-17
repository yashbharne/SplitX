import { TestBed } from '@angular/core/testing';

import { SendingReceivingDataService } from './sending-receiving-data.service';

describe('SendingReceivingDataService', () => {
  let service: SendingReceivingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SendingReceivingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

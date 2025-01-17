import { TestBed } from '@angular/core/testing';

import { GenerateAvatarService } from './generate-avatar.service';

describe('GenerateAvatarService', () => {
  let service: GenerateAvatarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateAvatarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

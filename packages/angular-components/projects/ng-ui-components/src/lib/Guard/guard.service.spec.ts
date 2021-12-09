import { TestBed } from '@angular/core/testing';

import { GuardService } from './guard.service';

describe('AuthingGuardService', () => {
  let service: GuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

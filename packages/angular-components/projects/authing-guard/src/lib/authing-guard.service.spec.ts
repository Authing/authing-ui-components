import { TestBed } from '@angular/core/testing';

import { AuthingGuardService } from './authing-guard.service';

describe('AuthingGuardService', () => {
  let service: AuthingGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthingGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

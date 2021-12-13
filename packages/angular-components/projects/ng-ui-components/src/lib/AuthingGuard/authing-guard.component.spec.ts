import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthingGuardComponent } from './authing-guard.component';

describe('AuthingGuardComponent', () => {
  let component: AuthingGuardComponent;
  let fixture: ComponentFixture<AuthingGuardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthingGuardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthingGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

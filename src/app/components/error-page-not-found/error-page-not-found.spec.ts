import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorPageNotFound } from './error-page-not-found';

describe('ErrorPageNotFound', () => {
  let component: ErrorPageNotFound;
  let fixture: ComponentFixture<ErrorPageNotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPageNotFound],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPageNotFound);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

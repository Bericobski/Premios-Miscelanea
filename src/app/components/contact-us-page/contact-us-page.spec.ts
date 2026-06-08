import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsPage } from './contact-us-page';

describe('ContactUsPage', () => {
  let component: ContactUsPage;
  let fixture: ComponentFixture<ContactUsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactUsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactUsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeTemplateComponent } from './stripe-template.component';

describe('StripeTemplateComponent', () => {
  let component: StripeTemplateComponent;
  let fixture: ComponentFixture<StripeTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StripeTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

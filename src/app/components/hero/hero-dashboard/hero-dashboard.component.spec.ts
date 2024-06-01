import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroDashboardComponent } from './hero-dashboard.component';

describe('HeroDashboardComponent', () => {
  let component: HeroDashboardComponent;
  let fixture: ComponentFixture<HeroDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeroDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

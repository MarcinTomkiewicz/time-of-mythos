import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBuildingsComponent } from './hero-buildings.component';

describe('HeroBuildingsComponent', () => {
  let component: HeroBuildingsComponent;
  let fixture: ComponentFixture<HeroBuildingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBuildingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeroBuildingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

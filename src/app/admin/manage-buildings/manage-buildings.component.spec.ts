import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBuildingsComponent } from './manage-buildings.component';

describe('ManageBuildingsComponent', () => {
  let component: ManageBuildingsComponent;
  let fixture: ComponentFixture<ManageBuildingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBuildingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageBuildingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

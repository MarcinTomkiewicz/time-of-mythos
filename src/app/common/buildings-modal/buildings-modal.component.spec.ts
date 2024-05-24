import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingsModalComponent } from './buildings-modal.component';

describe('BuildingsModalComponent', () => {
  let component: BuildingsModalComponent;
  let fixture: ComponentFixture<BuildingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

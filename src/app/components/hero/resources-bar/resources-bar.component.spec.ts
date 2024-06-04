import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesBarComponent } from './resources-bar.component';

describe('ResourcesBarComponent', () => {
  let component: ResourcesBarComponent;
  let fixture: ComponentFixture<ResourcesBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcesBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResourcesBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

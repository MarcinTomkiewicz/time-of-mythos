import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageItemsComponent } from './manage-items.component';

describe('ManageItemsComponent', () => {
  let component: ManageItemsComponent;
  let fixture: ComponentFixture<ManageItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageItemsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

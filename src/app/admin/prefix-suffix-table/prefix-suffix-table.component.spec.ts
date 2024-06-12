import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefixSuffixTableComponent } from './prefix-suffix-table.component';

describe('PrefixSuffixTableComponent', () => {
  let component: PrefixSuffixTableComponent;
  let fixture: ComponentFixture<PrefixSuffixTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrefixSuffixTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrefixSuffixTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, Input } from '@angular/core';
import { IPrefix, ISuffix } from '../../interfaces/definitions/i-item';
import { FirestoreService } from '../../services/firestore-service';
import { NgFor, NgIf } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-prefix-suffix-table',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './prefix-suffix-table.component.html',
  styleUrl: './prefix-suffix-table.component.css',
})
export class PrefixSuffixTableComponent {
  @Input() mode!: 'prefix' | 'suffix';

  prefixSuffixForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private firestoreService: FirestoreService
  ) {
    this.prefixSuffixForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.addNewItem(); // Add an initial row
  }

  get items(): FormArray {
    return this.prefixSuffixForm.get('items') as FormArray;
  }

  addNewItem() {
    const itemForm = this.fb.group({
      id: [Date.now()],
      name: [''],
      type: [this.mode],
      isPartOfSet: [false],
      setName: [''],
      requirements: [[]],
      bonuses: [[]],
      value: [0]
    });
    this.items.push(itemForm);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  saveAll() {
    const allItems = this.prefixSuffixForm.value.items;

    if (this.mode === 'prefix') {
      const prefixes: IPrefix[] = allItems;
      this.firestoreService.addPrefixes(prefixes).subscribe({
        next: () => console.log('Prefixes saved successfully'),
        error: (error) => console.error('Error saving prefixes', error)
      });
    } else if (this.mode === 'suffix') {
      const suffixes: ISuffix[] = allItems;
      this.firestoreService.addSuffixes(suffixes).subscribe({
        next: () => console.log('Suffixes saved successfully'),
        error: (error) => console.error('Error saving suffixes', error)
      });
    }
  }

  cancel() {
    this.activeModal.dismiss('cancel');
  }
}
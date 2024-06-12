import { Component, Input } from '@angular/core';
import { IPrefix, ISuffix } from '../../interfaces/definitions/i-item';
import { FirestoreService } from '../../services/firestore-service';
import { NgFor, NgIf } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IMetadata } from '../../interfaces/metadata/i-metadata';
import { forkJoin } from 'rxjs';
import { IBonus } from '../../interfaces/definitions/i-bonus';
import { IRequirement } from '../../interfaces/definitions/i-requirements';

@Component({
  selector: 'app-prefix-suffix-table',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './prefix-suffix-table.component.html',
  styleUrl: './prefix-suffix-table.component.css',
})
export class PrefixSuffixTableComponent {
  @Input() mode!: 'prefix' | 'suffix';

  prefixSuffixForm!: FormGroup;
  resourcesMetadata!: { [key: string]: IMetadata };
  attributesMetadata!: { [key: string]: IMetadata };
  bonusesMetadata!: { [key: string]: IMetadata };
  buildingsMetadata!: { [key: string]: IMetadata };
  resourceKeys: string[] = [];
  attributesKeys: string[] = [];
  bonusesKeys: string[] = [];
  buildingsKeys: string[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private firestoreService: FirestoreService
  ) {
    this.prefixSuffixForm = this.fb.group({
      items: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadMetadataAndInitializeForm();
  }

  loadMetadataAndInitializeForm() {
    forkJoin({
      resources: this.firestoreService.getMetadata('resourcesMetadata'),
      attributes: this.firestoreService.getMetadata('attributesMetdata'),
      bonuses: this.firestoreService.getMetadata('bonusesMetadata', true),
      buildings: this.firestoreService.getMetadata('buildingsMetadata'),
    }).subscribe({
      next: (data) => {
        this.resourcesMetadata = data.resources;
        this.resourceKeys = Object.keys(this.resourcesMetadata);
        
        this.attributesMetadata = data.attributes;
        this.attributesKeys = Object.keys(this.attributesMetadata);

        this.bonusesMetadata = data.bonuses;
        this.bonusesKeys = Object.keys(this.bonusesMetadata);

        this.buildingsMetadata = data.buildings;
        this.buildingsKeys = Object.keys(this.buildingsMetadata);

        this.addNewItem();
      },
      error: (error) => {
        console.error('Error loading metadata:', error);
      },
    });
  }

  get items(): FormArray {
    return this.prefixSuffixForm.get('items') as FormArray;
  }

  getBonuses(item: any): FormArray {
    return item.get('bonuses') as FormArray;
  }

  getRequirements(item: any): FormArray {
    return item.get('requirements') as FormArray;
  }

  addNewItem() {
    const items = this.fb.group({
      id: [Date.now()],
      name: [''],
      type: [this.mode],
      isPartOfSet: [false],
      setName: [''],
      bonuses: this.fb.array([]),
      requirements: this.fb.array([]),
      value: [0],
    });
    this.items.push(items);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  addRequirement(index: number): void {
    const requirementForm = this.createBonusGroup({ type: this.bonusesKeys[0], value: 0 });
    const requirementArray = this.items.at(index).get('requirements') as FormArray;
    requirementArray.push(requirementForm);
  }

  removeRequirement(rowIndex: number, requirementIndex: number): void {
    const requirementsArray = this.items.at(rowIndex).get('bonuses') as FormArray;
    requirementsArray.removeAt(requirementIndex);
  }
  
  onRequirementTypeChange(itemIndex: number, reqIndex: number): void {
    const requirementsArray = this.items.at(itemIndex).get('requirements') as FormArray;
    const reqGroup = requirementsArray.at(reqIndex) as FormGroup;
    const typeControl = reqGroup.get('type');

    if (typeControl?.value === 'building') {
      reqGroup.addControl(
        'buildingId',
        this.fb.control('', Validators.required)
      );
      reqGroup.addControl('level', this.fb.control('', Validators.required));
      reqGroup.removeControl('stat');
      reqGroup.removeControl('value');
    } else if (typeControl?.value === 'heroStat') {
      reqGroup.addControl(
        'stat',
        this.fb.control(this.attributesKeys[0], Validators.required)
      );
      reqGroup.addControl('value', this.fb.control('', Validators.required));
      reqGroup.removeControl('buildingId');
      reqGroup.removeControl('level');
    } else if (typeControl?.value === 'heroLevel') {
      reqGroup.addControl('value', this.fb.control('', Validators.required));
      reqGroup.removeControl('buildingId');
      reqGroup.removeControl('level');
      reqGroup.removeControl('stat');
    }
  }

  createRequirementGroup(requirement: IBonus): FormGroup {
    const group: FormGroup = this.fb.group({
      type: [requirement.type, Validators.required],
      value: [requirement.value || null, [Validators.required, Validators.min(1)]],
    });

    if (requirement.type === 'statChange') {
      group.addControl('attribute', this.fb.control(requirement.attribute ?? '', Validators.required));
    }

    return group;
  }

  addBonus(index: number): void {
    const bonusForm = this.createBonusGroup({ type: this.bonusesKeys[0], value: 0 });
    const bonusesArray = this.items.at(index).get('bonuses') as FormArray;
    bonusesArray.push(bonusForm);
  }

  removeBonus(rowIndex: number, bonusIndex: number): void {
    const bonusesArray = this.items.at(rowIndex).get('bonuses') as FormArray;
    bonusesArray.removeAt(bonusIndex);
  }

  onBonusTypeChange(itemIndex: number, bonusIndex: number): void {
    const bonusesArray = this.items.at(itemIndex).get('bonuses') as FormArray;
    const bonusGroup = bonusesArray.at(bonusIndex) as FormGroup;
    const typeControl = bonusGroup.get('type');

    if (!typeControl) {
      return;
    }

    const isStatChange = typeControl.value === 'statChange';

    if (isStatChange && !bonusGroup.get('attribute')) {
      this.addAttributeControl(bonusGroup);
    } else if (!isStatChange && bonusGroup.get('attribute')) {
      this.removeAttributeControl(bonusGroup);
    }
  }

  private addAttributeControl(bonusGroup: FormGroup): void {
    bonusGroup.addControl('attribute', this.fb.control('', Validators.required));
  }

  private removeAttributeControl(bonusGroup: FormGroup): void {
    bonusGroup.removeControl('attribute');
  }

  createBonusGroup(bonus: IBonus): FormGroup {
    const group: FormGroup = this.fb.group({
      type: [bonus.type, Validators.required],
      value: [bonus.value || null, [Validators.required, Validators.min(1)]],
    });

    if (bonus.type === 'statChange') {
      group.addControl('attribute', this.fb.control(bonus.attribute ?? '', Validators.required));
    }

    return group;
  }

  onSubmit() {
    const allItems = this.prefixSuffixForm.value.items;
    console.log(allItems);
    
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
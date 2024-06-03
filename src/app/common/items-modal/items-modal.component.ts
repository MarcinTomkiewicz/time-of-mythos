import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IRequirement } from '../../interfaces/definitions/i-requirements';
import { FirestoreService } from '../../services/firestore-service';
import { FormulasService } from '../../services/formulas-service';
import { forkJoin } from 'rxjs';
import { IMetadata } from '../../interfaces/metadata/i-metadata';
import { IBonus } from '../../interfaces/definitions/i-bonus';

@Component({
  selector: 'app-items-modal',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './items-modal.component.html',
  styleUrl: './items-modal.component.css',
})
export class ItemsModalComponent {
  @Input() itemType!: 'weapon' | 'armor' | 'jewelry' | 'prefix' | 'suffix';
  itemForm!: FormGroup;
  canAppearOnForm!: FormGroup;
  resourcesMetadata!: { [key: string]: IMetadata };
  attributesMetadata!: { [key: string]: IMetadata };
  bonusesMetadata!: { [key: string]: IMetadata };
  buildingsMetadata!: { [key: string]: IMetadata };
  resourceKeys: string[] = [];
  attributesKeys: string[] = [];
  bonusesKeys: string[] = [];
  buildingsKeys: string[] = [];
  itemTypes: string[] = [];
  selectedFile!: File;
  weaponsTypes: string[] = ['1h', '2h', 'Range', 'Throwing', 'Tactical'];
  armorTypes: string[] = ['Head', 'Chest', 'Feet', 'Hands', 'Legs'];
  jewelryTypes: string[] = ['Ring', 'Amulet'];
  weaponsControl: FormControl = new FormControl(false);
  armorControl: FormControl = new FormControl(false);
  jewelryControl: FormControl = new FormControl(false);
  canAppearOnOptions: FormControl = new FormControl([]);

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private formulasService: FormulasService
  ) {}

  ngOnInit(): void {
    this.loadMetadataAndInitializeForm();
  }

  loadMetadataAndInitializeForm() {
    forkJoin({
      resources: this.firestoreService.getMetadata('resourcesMetadata'),
      attributes: this.firestoreService.getMetadata('attributesMetdata'),
      bonuses: this.firestoreService.getMetadata('bonusesMetadata'),
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

        this.initializeForm();
      },
      error: (error) => {
        console.error('Error loading metadata:', error);
      },
    });

    switch (this.itemType) {
      case 'weapon':
        this.itemTypes = this.weaponsTypes;
        break;
      case 'armor':
        this.itemTypes = this.armorTypes;
        break;
      case 'jewelry':
        this.itemTypes = this.jewelryTypes;
        break;
      case 'prefix':
        this.itemTypes = [...this.weaponsTypes, ...this.armorTypes, ...this.jewelryTypes];
        break;
      case 'suffix':
        this.itemTypes = [...this.weaponsTypes, ...this.armorTypes, ...this.jewelryTypes];
        break;
      default:
        break;
    }    
  }

  initializeForm() {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      type: [''],
      requirements: this.fb.array([]),
      bonuses: this.fb.array([]),
      value: [0, Validators.required],
    });

    this.itemForm.get('type')?.valueChanges.subscribe((value) => {
      this.onTypeChange(value);
    });
    
    if(this.itemType === 'weapon') {
      this.itemForm.addControl('minDamage', new FormControl(0));
      this.itemForm.addControl('maxDamage', new FormControl(0));
      this.itemForm.addControl('icon', new FormControl(null));
    }

    if (this.itemType === 'armor') {
      this.itemForm.addControl('defense', new FormControl(0));
      this.itemForm.addControl('icon', new FormControl(null));
    }

    if (this.itemType === 'jewelry') {
      this.itemForm.addControl('icon', new FormControl(null));
    }

    if (this.itemType === 'prefix' || this.itemType === 'suffix') {
      this.itemForm.addControl('isSetItem', new FormControl(false));
      this.itemForm.addControl('setName', new FormControl(''));
      this.itemForm.addControl('canAppearOn', this.fb.group({
        weapon: [],
        armor: [],
        jewelry: [],
      })
    );
    } else {
      this.itemForm.removeControl('canAppearOn');
      this.itemForm.removeControl('isSetItem');
      this.itemForm.removeControl('setName');
    }
    
    if (this.itemType === 'prefix' || this.itemType === 'suffix') {
      this.canAppearOnOptions = this.fb.control([]);
      this.itemForm.addControl('options', this.canAppearOnOptions);
  
      this.canAppearOnOptions.valueChanges.subscribe((value) => {
        this.updateCanAppearOn(value);
      });
    }
  }

  onTypeChange(type: string) {
    this.itemForm.get('minDamage')?.clearValidators();
    this.itemForm.get('maxDamage')?.clearValidators();
    this.itemForm.get('defense')?.clearValidators();
    this.itemForm.get('canAppearOn')?.clearValidators();

    if (type === 'weapon') {
      this.itemForm.get('minDamage')?.setValidators([Validators.required, Validators.min(0)]);
      this.itemForm.get('maxDamage')?.setValidators([Validators.required, Validators.min(0)]);
    } else if (type === 'armor') {
      this.itemForm.get('defense')?.setValidators([Validators.required, Validators.min(0)]);
    } else if (type === 'prefix' || type === 'suffix') {

      this.itemForm.addControl('canAppearOn', this.fb.group({
        weapon: [],
        armor: [],
        jewelry: [],
      }));
      
    }
    this.itemForm.get('minDamage')?.updateValueAndValidity();
    this.itemForm.get('maxDamage')?.updateValueAndValidity();
    this.itemForm.get('defense')?.updateValueAndValidity();
    this.itemForm.get('canAppearOn')?.updateValueAndValidity();
    this.itemForm.get('isSetItem')?.updateValueAndValidity();
    this.itemForm.get('setName')?.updateValueAndValidity();
  }

  updateCanAppearOn(selectedOptions: string[]) {
    const canAppearOnFormGroup = this.itemForm.get('canAppearOn') as FormGroup;
  
    Object.keys(canAppearOnFormGroup.controls).forEach((key) => {
      const control = canAppearOnFormGroup.get(key) as FormArray;
      if (selectedOptions.includes(this.capitalizeFirstLetter(key))) {
        control.setValidators(Validators.required);
      } else {
        control.clearValidators();
        control.reset([]);
      }
    });
  
    canAppearOnFormGroup.updateValueAndValidity();
  }
  
  onCheckboxChange(type: string, event: any) {
    const options = this.canAppearOnOptions.value;
    if (event.target.checked) {
      options.push(type);
    } else {
      const index = options.indexOf(type);
      if (index > -1) {
        options.splice(index, 1);
      }
    }
    this.canAppearOnOptions.setValue(options);
  }
  
  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  addCanAppearOnControl(type: string) {
    const canAppearOn = this.itemForm.get('canAppearOn') as FormGroup;
    canAppearOn.addControl(type, this.fb.array([]));
  }
  
  removeCanAppearOnControl(type: string) {
    const canAppearOn = this.itemForm.get('canAppearOn') as FormGroup;
    canAppearOn.removeControl(type);
  }
  
  get weaponsArray(): FormControl {
    return this.itemForm.get(['canAppearOn', 'weapon']) as FormControl;
  }
  
  get armorArray(): FormControl {
    return this.itemForm.get(['canAppearOn', 'armor']) as FormControl;
  }
  
  get jewelryArray(): FormControl {
    return this.itemForm.get(['canAppearOn', 'jewelry']) as FormControl;
  }

  uniqueValidator(config: {
    controlName: string;
    alternativeControlName?: string;
  }): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      const controls = (formArray as FormArray).controls;
      const values = controls.map((control) => {
        const mainValue = control.get(config.controlName)?.value;
        const altValue = config.alternativeControlName
          ? control.get(config.alternativeControlName)?.value
          : null;
        return altValue ? `${mainValue}-${altValue}` : mainValue;
      });
      const hasDuplicates = values.some(
        (value, index) => values.indexOf(value) !== index
      );
      return hasDuplicates ? { notUnique: true } : null;
    };
  }

  uniqueRequirementValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      const controls = (formArray as FormArray).controls;
      const values = controls.map((control) => {
        const type = control.get('type')?.value;
        if (type === 'building') {
          return control.get('buildingId')?.value;
        } else if (type === 'heroStat') {
          return control.get('stat')?.value;
        } else if (type === 'heroLevel') {
          return control.get('type')?.value; // since heroLevel type only has 'type' as unique key
        }
        return null;
      });
      const hasDuplicates = values.some(
        (value, index) => value && values.indexOf(value) !== index
      );
      return hasDuplicates ? { notUnique: true } : null;
    };
  }

  atLeastOneArrayHasValue(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const weaponsArray = group.get('weapon') as FormArray;
      const armorArray = group.get('armor') as FormArray;
      const jewelryArray = group.get('jewelry') as FormArray;
  
      const hasValue = (arr: FormArray) => arr && arr.controls.length > 0;
  
      if (hasValue(weaponsArray) || hasValue(armorArray) || hasValue(jewelryArray)) {
        return null;
      }
      return { atLeastOneArrayHasValue: true };
    };
  }

  createRequirementGroup(requirement: IRequirement): FormGroup {
    if (requirement.type === 'building') {
      return this.fb.group({
        type: [requirement.type, Validators.required],
        buildingId: [requirement.buildingId, Validators.required],
        level: [requirement.level, [Validators.required, Validators.min(1)]],
      });
    } else if (requirement.type === 'heroStat') {
      return this.fb.group({
        type: [requirement.type, Validators.required],
        stat: [requirement.stat, Validators.required],
        value: [requirement.value, [Validators.required, Validators.min(1)]],
      });
    } else if (requirement.type === 'heroLevel') {
      return this.fb.group({
        type: [requirement.type, Validators.required],
        value: [requirement.value, [Validators.required, Validators.min(1)]],
      });
    } else {
      throw new Error('Unknown requirement type');
    }
  }

  onRequirementTypeChange(index: number): void {
    const reqGroup = this.requirements.at(index) as FormGroup;
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

  addRequirement(): void {
    this.requirements.push(
      this.createRequirementGroup({
        type: 'heroStat',
        stat: 'strength',
        value: 1,
      })
    );
  }

  removeRequirement(index: number): void {
    this.requirements.removeAt(index);
  }

  get requirements(): FormArray {
    return this.itemForm.get('requirements') as FormArray;
  }

  get bonuses(): FormArray {
    return this.itemForm.get('bonuses') as FormArray;
  }

  createBonusGroup(bonus: IBonus): FormGroup {
    return this.fb.group({
      type: [bonus.type, Validators.required],
      value: [bonus.value, [Validators.required, Validators.min(1)]],
    });
  }

  addBonus(): void {
    if (this.bonuses.length < 3) {
      this.bonuses.push(
        this.createBonusGroup({ type: this.bonusesKeys[0], value: 0 })
      );
    }
  }

  removeBonus(index: number): void {
    this.bonuses.removeAt(index);
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.itemForm.patchValue({
          icon: reader.result,
        });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    console.log(this.itemForm.value);
  }

  cancel() {
    this.activeModal.dismiss('cancel');
  }
}

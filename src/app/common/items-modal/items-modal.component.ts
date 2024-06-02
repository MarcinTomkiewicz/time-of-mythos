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
      type: ['', Validators.required],
      isSetItem: [false],
      setName: [''],
      requirements: this.fb.array([]),
      bonuses: this.fb.array([]),
      value: [0, Validators.required],
      icon: [null, Validators.required],
      minDamage: [0],
      maxDamage: [0],
      defense: [0],
      canAppearOn: this.fb.array([]),
    });

    this.itemForm.get('type')?.valueChanges.subscribe((value) => {
      this.onTypeChange(value);
    });


    this.canAppearOnForm = this.fb.group({
      weapon: false,
      armor: false,
      jewelry: false
    });
  }

  get canAppearOnControls() {
    return this.canAppearOnForm.controls;
  }

  onTypeChange(type: string) {
    this.itemForm.get('minDamage')?.clearValidators();
    this.itemForm.get('maxDamage')?.clearValidators();
    this.itemForm.get('defense')?.clearValidators();
    this.itemForm.get('canAppearOn')?.clearValidators();

    if (type === 'weapon') {
      console.log(type);
      this.itemForm.get('minDamage')?.setValidators([Validators.required, Validators.min(0)]);
      this.itemForm.get('maxDamage')?.setValidators([Validators.required, Validators.min(0)]);
    } else if (type === 'armor') {
      this.itemForm.get('defense')?.setValidators([Validators.required, Validators.min(0)]);
    } else if (type === 'prefix' || type === 'suffix') {
      console.log("Hello");
      
    }

    this.itemForm.get('minDamage')?.updateValueAndValidity();
    this.itemForm.get('maxDamage')?.updateValueAndValidity();
    this.itemForm.get('defense')?.updateValueAndValidity();
    this.itemForm.get('canAppearOn')?.updateValueAndValidity();
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
      console.log(this.itemForm.get('profilePicture')?.value);

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

import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { IBuilding, ICost } from '../../interfaces/definitions/i-building';
import { NgFor, NgIf } from '@angular/common';
import { IRequirement } from '../../interfaces/definitions/i-requirements';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { IMetadata } from '../../interfaces/metadata/i-metadata';
import { FirestoreService } from '../../services/firestore-service';
import { IBonus } from '../../interfaces/definitions/i-bonus';
import { ResourceType } from '../../interfaces/definitions/i-resources';
import { FormulasService } from '../../services/formulas-service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-buildings-modal',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, NgbAlert],
  templateUrl: './buildings-modal.component.html',
  styleUrl: './buildings-modal.component.css',
})
export class BuildingsModalComponent implements OnInit {
  buildingName: string = '';
  buildingData!: IBuilding;
  buildingForm!: FormGroup;
  testForm!: FormGroup;
  resourcesMetadata!: { [key: string]: IMetadata };
  attributesMetadata!: { [key: string]: IMetadata };
  bonusesMetadata!: { [key: string]: IMetadata };
  buildingsMetadata!: { [key: string]: IMetadata };
  resourceKeys: string[] = [];
  attributesKeys: string[] = [];
  bonusesKeys: string[] = [];
  buildingsKeys: string[] = [];
  showTestForm = {
    cost: false,
    buildTime: false,
    requirement: false,
    bonus: false,
  };
  testResult: {
    bonuses: IBonus[];
    requirements: IRequirement[];
    buildTime: number;
    cost: ICost[];
  } = { bonuses: [], requirements: [], buildTime: 0, cost: [] };
  errorMessage = '';
  successMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
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
      buildings: this.firestoreService.getMetadata('buildingsMetadata')
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
      }
    });
  }

  initializeForm() {
    this.buildingForm = this.formBuilder.group({
      id: [
        { value: this.buildingData.id, disabled: true },
        Validators.required,
      ],
      cost: this.formBuilder.array(
        this.buildingData.cost.map((cost) => this.createCostGroup(cost)),
        [Validators.required, this.uniqueValidator({ controlName: 'resource' })]
      ),
      buildTime: [
        this.buildingData.buildTime,
        [Validators.required, Validators.min(1)],
      ],
      requirements: this.formBuilder.array(
        this.buildingData.requirements.map((requirement) =>
          this.createRequirementGroup(requirement)
        ),
        [Validators.required, this.uniqueRequirementValidator()]
      ),
      bonuses: this.formBuilder.array(
        this.buildingData.bonuses.map((bonus) => this.createBonusGroup(bonus)),
        [Validators.required, this.uniqueValidator({ controlName: 'type' })]
      ),
      costFormula: [this.buildingData.costFormula, Validators.required],
      buildTimeFormula: [
        this.buildingData.buildTimeFormula,
        Validators.required,
      ],
      requirementFormula: [
        this.buildingData.requirementFormula,
        Validators.required,
      ],
      bonusFormula: [this.buildingData.bonusFormula, Validators.required],
      minPlayerHierarchyLevel: [
        this.buildingData.minPlayerHierarchyLevel,
        Validators.required,
      ],
      maxBuildingLevel: [
        this.buildingData.maxBuildingLevel,
        Validators.required,
      ],
      icon: [this.buildingData.icon, Validators.required],
    });

    this.testForm = this.formBuilder.group({
      costCurrentLevel: [1, [Validators.required, Validators.min(1)]],
      buildTimeCurrentLevel: [0, Validators.required],
      requirementCurrentLevel: [0, Validators.required],
      bonusCurrentLevel: [0, Validators.required],
    });
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

  createCostGroup(cost: ICost): FormGroup {
    return this.formBuilder.group({
      resource: [cost.resource, Validators.required],
      amount: [cost.amount, [Validators.required, Validators.min(1)]],
    });
  }

  createRequirementGroup(requirement: IRequirement): FormGroup {
    if (requirement.type === 'building') {
      return this.formBuilder.group({
        type: [requirement.type, Validators.required],
        buildingId: [requirement.buildingId, Validators.required],
        level: [requirement.level, [Validators.required, Validators.min(1)]],
      });
    } else if (requirement.type === 'heroStat') {
      return this.formBuilder.group({
        type: [requirement.type, Validators.required],
        stat: [requirement.stat, Validators.required],
        value: [requirement.value, [Validators.required, Validators.min(1)]],
      });
    } else if (requirement.type === 'heroLevel') {
      return this.formBuilder.group({
        type: [requirement.type, Validators.required],
        value: [requirement.value, [Validators.required, Validators.min(1)]],
      });
    } else {
      throw new Error('Unknown requirement type');
    }
  }

  createBonusGroup(bonus: IBonus): FormGroup {
    return this.formBuilder.group({
      type: [bonus.type, Validators.required],
      value: [bonus.value, [Validators.required, Validators.min(1)]],
    });
  }

  addCost(): void {
    if (this.cost.length < 3) {
      this.cost.push(
        this.createCostGroup({ resource: ResourceType.Drachma, amount: 0 })
      );
    }
  }

  removeCost(index: number): void {
    if (this.cost.length > 1) {
      this.cost.removeAt(index);
    }
  }

  addRequirement(): void {
    this.requirements.push(
      this.createRequirementGroup({
        type: 'building',
        buildingId: '',
        level: 1,
      })
    );
  }

  removeRequirement(index: number): void {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
    }
  }

  addBonus(): void {
    if (this.bonuses.length < 3) {
      this.bonuses.push(
        this.createBonusGroup({ type: this.bonusesKeys[0], value: 0 })
      );
    }
  }

  removeBonus(index: number): void {
    if (this.bonuses.length > 1) {
      this.bonuses.removeAt(index);
    }
  }

  testCost() {
    const formula = this.buildingForm.get('costFormula')?.value;
    const baseCost = this.buildingForm.get('cost')?.value;
    const level = this.testForm.get('costCurrentLevel')?.value;
    this.testResult.cost = this.formulasService.calculateCostFormula(
      formula,
      baseCost,
      level
    );
  }

  testRequirements() {
    const formula = this.buildingForm.get('requirementFormula')?.value;
    const baseRequirements = this.buildingForm.get('requirements')?.value;
    const level = this.testForm.get('requirementCurrentLevel')?.value;
    this.testResult.requirements =
      this.formulasService.calculateRequirementsFormula(
        formula,
        baseRequirements,
        level
      );
  }

  testBuildTime() {
    const formula = this.buildingForm.get('buildTimeFormula')?.value;
    const baseBuildTime = this.buildingForm.get('buildTime')?.value;
    const level = this.testForm.get('buildTimeCurrentLevel')?.value;
    this.testResult.buildTime = this.formulasService.calculateBuildTimeFormula(
      formula,
      baseBuildTime,
      level
    );
  }

  testBonuses() {
    const formula = this.buildingForm.get('bonusFormula')?.value;
    const baseBonuses = this.buildingForm.get('bonuses')?.value;
    const level = this.testForm.get('bonusCurrentLevel')?.value;
    this.testResult.bonuses = this.formulasService.calculateBonusFormula(
      formula,
      baseBonuses,
      level
    );
  }

  onRequirementTypeChange(index: number): void {
    const reqGroup = this.requirements.at(index) as FormGroup;
    const typeControl = reqGroup.get('type');

    if (typeControl?.value === 'building') {
      reqGroup.addControl(
        'buildingId',
        this.formBuilder.control('', Validators.required)
      );
      reqGroup.addControl(
        'level',
        this.formBuilder.control('', Validators.required)
      );
      reqGroup.removeControl('stat');
      reqGroup.removeControl('value');
    } else if (typeControl?.value === 'heroStat') {
      reqGroup.addControl(
        'stat',
        this.formBuilder.control(this.attributesKeys[0], Validators.required)
      );
      reqGroup.addControl(
        'value',
        this.formBuilder.control('', Validators.required)
      );
      reqGroup.removeControl('buildingId');
      reqGroup.removeControl('level');
    } else if (typeControl?.value === 'heroLevel') {
      reqGroup.addControl(
        'value',
        this.formBuilder.control('', Validators.required)
      );
      reqGroup.removeControl('buildingId');
      reqGroup.removeControl('level');
      reqGroup.removeControl('stat');
    }
  }

  toggleTestForm(formulaType: keyof typeof this.showTestForm) {
    this.showTestForm[formulaType] = !this.showTestForm[formulaType];
  }

  get cost(): FormArray {
    return this.buildingForm.get('cost') as FormArray;
  }

  get requirements(): FormArray {
    return this.buildingForm.get('requirements') as FormArray;
  }

  get bonuses(): FormArray {
    return this.buildingForm.get('bonuses') as FormArray;
  }

  submitForm() {
    if (this.buildingForm.valid) {
      console.log('Submitted building data:', this.buildingForm.value);
    } else {
      console.error('Form is invalid.');
    }
  }

  saveBuilding() {
    if (this.buildingForm.valid) {
      const updatedBuildingData = this.buildingForm.getRawValue();
      console.log(
        updatedBuildingData,
        this.buildingName
          .toLowerCase()
          .replace(/ (.)/g, (match, group1) => group1.toUpperCase())
      );

      this.firestoreService
        .updateBuilding(
          this.buildingName
            .toLowerCase()
            .replace(/ (.)/g, (match, group1) => group1.toUpperCase()),
          updatedBuildingData
        )
        .pipe(
          finalize(() => {
            console.log('Building update process finalized.');
          })
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Building updated successfully!';
          },
          error: (error) => {
            console.error('Error updating building: ', error);
          },
        });
    }
  }

  cancel() {
    this.activeModal.dismiss('cancel');
  }

  getRequirementDescription(requirement: IRequirement): string {
    switch (requirement.type) {
      case 'building':
        return `${requirement.buildingId} level ${requirement.level},`;
      case 'heroStat':
        return `${requirement.stat} ${requirement.value},`;
      case 'heroLevel':
        return `${requirement.type} ${requirement.value},`;
      default:
        return `Unknown requirement type`;
    }
  }
}

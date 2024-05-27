import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IBuilding, ICost } from '../../interfaces/definitions/i-building';
import { NgFor, NgIf } from '@angular/common';
import { IRequirement } from '../../interfaces/definitions/i-requirements';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IMetadata } from '../../interfaces/metadata/i-metadata';
import { FirestoreService } from '../../services/firestore-service';
import { IBonus } from '../../interfaces/definitions/i-bonus';
import { ResourceType } from '../../interfaces/definitions/i-resources';

@Component({
  selector: 'app-buildings-modal',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './buildings-modal.component.html',
  styleUrl: './buildings-modal.component.css',
})
export class BuildingsModalComponent implements OnInit {
  buildingName: string = '';
  buildingData!: IBuilding;
  buildingForm!: FormGroup;
  resourcesMetadata!: { [key: string]: IMetadata };
  attributesMetadata!: { [key: string]: IMetadata };
  bonusesMetadata!: { [key: string]: IMetadata };
  resourceKeys: string[] = [];
  attributesKeys: string[] = [];
  bonusesKeys: string[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.loadMetadataAndInitializeForm();
  }

  loadMetadataAndInitializeForm() {
    this.firestoreService
      .getMetadata('resourcesMetadata')
      .subscribe((resourcesMetadata: { [key: string]: IMetadata }) => {
        this.resourcesMetadata = resourcesMetadata;
        this.resourceKeys = Object.keys(this.resourcesMetadata);

        this.firestoreService
          .getMetadata('attributesMetdata')
          .subscribe((attributesMetadata: { [key: string]: IMetadata }) => {
            this.attributesMetadata = attributesMetadata;
            this.attributesKeys = Object.keys(this.attributesMetadata);

            this.firestoreService
              .getMetadata('bonusesMetadata')
              .subscribe((bonusesMetadata: { [key: string]: IMetadata }) => {
                this.bonusesMetadata = bonusesMetadata;
                this.bonusesKeys = Object.keys(this.bonusesMetadata);
                this.initializeForm();
              });
          });
      });
  }

  initializeForm() {
    this.buildingForm = this.formBuilder.group({
      id: [{ value: this.buildingData.id, disabled: true }],
      cost: this.formBuilder.array(
        this.buildingData.cost.map((cost) => this.createCostGroup(cost))
      ),
      buildTime: [this.buildingData.buildTime, Validators.required],
      requirements: this.formBuilder.array(
        this.buildingData.requirements.map((requirement) =>
          this.createRequirementGroup(requirement)
        )
      ),
      bonuses: this.formBuilder.array(
        this.buildingData.bonuses.map((bonus) => this.createBonusGroup(bonus))
      ),
      costFormula: [this.buildingData.costFormula],
      buildTimeFormula: [this.buildingData.buildTimeFormula],
      requirementFormula: [this.buildingData.requirementFormula],
      bonusFormula: [this.buildingData.bonusFormula],
      minPlayerHierarchyLevel: [this.buildingData.minPlayerHierarchyLevel],
      maxBuildingLevel: [this.buildingData.maxBuildingLevel],
      icon: [this.buildingData.icon],
    });
  }

  createCostGroup(cost: ICost): FormGroup {
    return this.formBuilder.group({
      resource: [cost.resource, Validators.required],
      amount: [cost.amount, [Validators.required, Validators.min(0)]],
    });
  }

  createRequirementGroup(requirement: IRequirement): FormGroup {
    if (requirement.type === 'building') {
      return this.formBuilder.group({
        type: [requirement.type, Validators.required],
        buildingId: [requirement.buildingId, Validators.required],
        level: [requirement.level, Validators.required],
      });
    } else if (requirement.type === 'heroStat') {
      return this.formBuilder.group({
        type: [requirement.type, Validators.required],
        stat: [requirement.stat, Validators.required],
        value: [requirement.value, Validators.required],
      });
    } else if (requirement.type === 'heroLevel') {
      return this.formBuilder.group({
        type: [requirement.type, Validators.required],
        value: [requirement.value, Validators.required],
      });
    } else {
      throw new Error('Unknown requirement type');
    }
  }

  createBonusGroup(bonus: IBonus): FormGroup {
    return this.formBuilder.group({
      type: [bonus.type, Validators.required],
      value: [bonus.value, Validators.required],
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

  proceed() {
    this.activeModal.close('proceed');
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

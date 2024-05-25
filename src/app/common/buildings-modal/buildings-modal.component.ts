import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IBuilding, ICost } from '../../interfaces/definitions/i-building';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  IBuildingRequirement,
  IHeroLevelRequirement,
  IHeroStatRequirement,
  IRequirement,
} from '../../interfaces/definitions/i-requirements';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IMetadata } from '../../interfaces/metadata/i-metadata';
import { FirestoreService } from '../../services/firestore-service';
import { IBonus } from '../../interfaces/definitions/i-bonus';

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
        this.initializeForm();
      });
  }

  initializeForm() {
    this.buildingForm = this.formBuilder.group({
      id: [{ value: this.buildingData.id, disabled: true }],
      cost: this.formBuilder.array(
        this.buildingData.cost.map((cost) => this.createCostGroup(cost))
      ),
      buildTime: [this.buildingData.buildTime, Validators.required],
      requirements: this.formBuilder.array(this.buildingData.requirements.map(requirement => this.createRequirementGroup(requirement))),
      bonuses: this.formBuilder.array(this.buildingData.bonuses.map(bonus => this.createBonusGroup(bonus))),
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
      resource: [
        this.resourcesMetadata[cost.resource]?.displayName || 'Unknown',
        Validators.required,
      ],
      amount: [cost.amount, Validators.required],
    });
  }

  // createResourceGroup(cost: ICost): FormGroup {
  //   return this.formBuilder.group({
  //     resource: [
  //       this.resourcesMetadata[cost.resource]?.displayName || 'Unknown',
  //       Validators.required,
  //     ],
  //     amount: [cost.amount, Validators.required],
  //   });
  // }
  
  createRequirementGroup(requirement: IRequirement): FormGroup {
    if (requirement.type === 'building') {
      const req = requirement;
      return this.formBuilder.group({
        type: [req.type, Validators.required],
        buildingId: [req.buildingId, Validators.required],
        level: [req.level, Validators.required],
      });
    } else if (requirement.type === 'heroStat') {
      const req = requirement;
      return this.formBuilder.group({
        type: [req.type, Validators.required],
        stat: [req.stat, Validators.required],
        value: [req.value, Validators.required],
      });
    } else if (requirement.type === 'heroLevel') {
      const req = requirement;
      return this.formBuilder.group({
        type: [req.type, Validators.required],
        value: [req.value, Validators.required],
      });
    } else {
      // Można wyrzucić błąd, gdy typ wymagania jest nieznany
      throw new Error('Unknown requirement type');
    }
  }
  
  createBonusGroup(bonus: IBonus): FormGroup {
    return this.formBuilder.group({
      type: [bonus.type, Validators.required],
      value: [bonus.value, Validators.required],
      resource: [bonus.resource ?? ''],
    });
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

  isResourceBonus(index: number): boolean {
    const bonusGroup = this.bonuses.at(index) as FormGroup;
    return bonusGroup.get('type')?.value === 'resourceGrowth'; // Upewnij się, że 'resource' jest prawidłowym typem bonusu
  }

  onBonusTypeChange(index: number): void {
    const bonusGroup = this.bonuses.at(index) as FormGroup;
    const typeControl = bonusGroup.get('type');
    if (typeControl?.value !== 'resource') {
      bonusGroup.get('resource')?.setValue('');
    }
  }

  submitForm() {
    if (this.buildingForm.valid) {
      // Tutaj możesz wysłać dane do bazy danych
      console.log('Submitted building data:', this.buildingForm.value);
      // Na razie tylko logujemy dane, musisz jeszcze zaimplementować wysyłanie do bazy danych
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

import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IBuilding } from '../../interfaces/definitions/i-building';
import { CommonModule } from '@angular/common';
import { IBuildingRequirement, IHeroLevelRequirement, IHeroStatRequirement, IRequirement } from '../../interfaces/definitions/i-requirements';

@Component({
  selector: 'app-buildings-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buildings-modal.component.html',
  styleUrl: './buildings-modal.component.css'
})
export class BuildingsModalComponent {
  buildingName: string = '';
  buildingData!: IBuilding;
  
  constructor(public activeModal: NgbActiveModal) {
        
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

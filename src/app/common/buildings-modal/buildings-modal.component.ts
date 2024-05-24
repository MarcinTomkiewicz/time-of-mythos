import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IBuilding } from '../../interfaces/definitions/i-building';
import { CommonModule } from '@angular/common';

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
}

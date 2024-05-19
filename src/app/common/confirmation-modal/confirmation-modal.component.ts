import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent {
  public selectedOption: string = '';
  public confirmationQuestion: string = '';
  public confirmationData: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  proceed() {
    this.activeModal.close('proceed');
  }

  cancel() {
    this.activeModal.dismiss('cancel');
  }
}

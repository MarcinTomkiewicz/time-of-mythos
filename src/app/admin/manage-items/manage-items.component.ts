import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirestoreService } from '../../services/firestore-service';
import { AuthService } from '../../services/auth-service';
import { IUser } from '../../interfaces/general/i-user';
import { NgIf } from '@angular/common';
import { ItemsModalComponent } from '../../common/items-modal/items-modal.component';

@Component({
  selector: 'app-manage-items',
  standalone: true,
  imports: [NgIf],
  templateUrl: './manage-items.component.html',
  styleUrl: './manage-items.component.css'
})
export class ManageItemsComponent implements OnInit {
  isAdmin: boolean = false;
  user: IUser | null = null;
  userUid: string | null = null;
  isLoggedIn: boolean = false;


  constructor(private modalService: NgbModal,     private authService: AuthService,
    private firestoreService: FirestoreService) { }

    ngOnInit(): void {
      this.authService.getUser().subscribe((user: IUser | null) => {
        this.userUid = this.authService.getUserUID();
  
        this.user = user;
        if (this.userUid && this.user?.isAdmin) {
          this.isAdmin = true;
        }
      });
    }

  openManageItemsModal(itemType: 'weapon' | 'armor' | 'jewelry' | 'prefix' | 'suffix') {
    const modalRef = this.modalService.open(ItemsModalComponent, { size: 'xl' });
    modalRef.componentInstance.itemType = itemType;
  }

}

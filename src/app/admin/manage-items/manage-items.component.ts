import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirestoreService } from '../../services/firestore-service';
import { AuthService } from '../../services/auth-service';
import { IUser } from '../../interfaces/general/i-user';
import { NgFor, NgIf } from '@angular/common';
import { ItemsModalComponent } from '../../common/items-modal/items-modal.component';
import { IArmor, IItem, IPrefix, ISuffix } from '../../interfaces/definitions/i-item';
import { CapitalizePipe } from '../../pipes/capitalize-pipe';

@Component({
  selector: 'app-manage-items',
  standalone: true,
  imports: [NgIf, CapitalizePipe, NgFor],
  templateUrl: './manage-items.component.html',
  styleUrl: './manage-items.component.css'
})
export class ManageItemsComponent implements OnInit {
  isAdmin: boolean = false;
  user: IUser | null = null;
  userUid: string | null = null;
  isLoggedIn: boolean = false;
  itemTypes: string[] = ['weapon', 'armor', 'jewelry', 'prefix', 'suffix']
  currentItemType: 'weapon' | 'armor' | 'jewelry' | 'prefix' | 'suffix' | null = null;
  items!: IItem[] | IArmor[] | IPrefix[] | ISuffix[];
  selectedItem = '';

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

  showItems(itemType: string) {
    this.firestoreService.getDefinitions(`definitions/${itemType}`, 'id').subscribe((items: { [key: string]: IItem | IArmor | IPrefix | ISuffix}) => {
      this.items = Object.values(items);
      this.selectedItem = itemType;
    });
  }
  
  editItem(item: any): void {
    console.log(item);
  }

}

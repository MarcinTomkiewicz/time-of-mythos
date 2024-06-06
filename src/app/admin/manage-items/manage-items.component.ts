import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirestoreService } from '../../services/firestore-service';
import { AuthService } from '../../services/auth-service';
import { IUser } from '../../interfaces/general/i-user';
import { NgFor, NgIf } from '@angular/common';
import { ItemsModalComponent } from '../../common/items-modal/items-modal.component';
import {
  IArmor,
  IItem,
  IPrefix,
  ISuffix,
} from '../../interfaces/definitions/i-item';
import { CapitalizePipe } from '../../pipes/capitalize-pipe';
import { CommonService } from '../../services/common-service';

@Component({
  selector: 'app-manage-items',
  standalone: true,
  imports: [NgIf, CapitalizePipe, NgFor],
  templateUrl: './manage-items.component.html',
  styleUrl: './manage-items.component.css',
})
export class ManageItemsComponent implements OnInit {
  isAdmin: boolean = false;
  user: IUser | null = null;
  userUid: string | null = null;
  isLoggedIn: boolean = false;
  itemTypes: string[] = ['weapon', 'armor', 'jewelry', 'prefix', 'suffix'];
  currentItemType: 'weapon' | 'armor' | 'jewelry' | 'prefix' | 'suffix' | null =
    null;
  items: (IItem | IArmor | IPrefix | ISuffix)[] = [];
  selectedItem = '';
  sortColumn: string = '';
  sortAscending: boolean = true;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    public commonService: CommonService,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.userUid = this.authService.getUserUID();

      this.user = user;
      if (this.userUid && this.user?.isAdmin) {
        this.isAdmin = true;
      }
    });
  }

  openManageItemsModal(
    itemType: 'weapon' | 'armor' | 'jewelry' | 'prefix' | 'suffix'
  ) {
    const modalRef = this.modalService.open(ItemsModalComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.itemType = itemType;
  }

  showItems(itemType: string) {
    this.firestoreService
      .getDefinitions(`definitions/${itemType}`, 'id')
      .subscribe(
        (items: { [key: string]: IItem | IArmor | IPrefix | ISuffix }) => {
          this.items = Object.values(items);
          this.selectedItem = itemType;
        }
      );
  }

  sortItems(column: string): void {
    if (this.sortColumn === column) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortColumn = column;
      this.sortAscending = true;
    }
    this.items.sort((a, b) => {
      const aValue = this.getProperty(a, column);
      const bValue = this.getProperty(b, column);
      if (aValue < bValue) {
        return this.sortAscending ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortAscending ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  getProperty(item: any, column: string): any {
    switch (column) {
      case 'name':
      case 'type':
      case 'id':
      case 'value':
        return item[column];
      default:
        return '';
    }
  }

  onHeaderKeydown(event: KeyboardEvent, column: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.sortItems(column);
      event.preventDefault();
    }
  }

  editItem(item: any): void {
    console.log(item);
  }
}

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
  ItemWithOptionalIcon,
} from '../../interfaces/definitions/i-item';
import { CapitalizePipe } from '../../pipes/capitalize-pipe';
import { CommonService } from '../../services/common-service';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { PrefixSuffixTableComponent } from '../prefix-suffix-table/prefix-suffix-table.component';

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
  items: ItemWithOptionalIcon[] = [];
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

  openBulkCreateAfixes(mode: string) {
    const modalRef = this.modalService.open(PrefixSuffixTableComponent, {
      size: 'xl',
    });
    modalRef.componentInstance.mode = mode;
  }

  showItems(itemType: string) {
    this.firestoreService
      .getDefinitions(`definitions/${itemType}`, 'id')
      .pipe(
        switchMap((items: { [key: string]: IItem | IArmor }) => {
          const itemArray = Object.values(items);
          const observables = itemArray.map(item => this.fetchItemIconUrl(item));
          return forkJoin(observables);
        })
      )
      .subscribe(
        (items: (IItem | IArmor )[]) => {
          this.items = items;
          this.selectedItem = itemType;
        }
      );
  }

  fetchItemIconUrl(item: IItem | IArmor ): Observable<IItem | IArmor> {
    if (!item.icon) {
      return new Observable(observer => {
        observer.next(item);
        observer.complete();
      });
    }
    return this.firestoreService.getDownloadUrl(item.icon).pipe(
      map(url => {
        item.icon = url;
        return item;
      })
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

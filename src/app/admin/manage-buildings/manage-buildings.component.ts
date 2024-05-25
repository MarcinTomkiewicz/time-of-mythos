import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FirestoreService } from '../../services/firestore-service';
import { NgFor, NgIf } from '@angular/common';
import { IBuilding } from '../../interfaces/definitions/i-building';
import { IMetadata } from '../../interfaces/metadata/i-metadata';
import { IUser } from '../../interfaces/general/i-user';
import { BuildingsModalComponent } from '../../common/buildings-modal/buildings-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-manage-buildings',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './manage-buildings.component.html',
  styleUrl: './manage-buildings.component.css',
})
export class ManageBuildingsComponent implements OnInit {
  isAdmin: boolean = false;
  buildingsDefinition!: { [key: string]: IBuilding };
  buildingsMetadata!: { [key: string]: IMetadata };
  buildingsToDisplay: string[] = []
  user: IUser | null = null;
  userUid: string | null = null;
  isLoggedIn: boolean = false;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.userUid = this.authService.getUserUID();

      this.user = user;
      if (this.userUid && this.user?.isAdmin) {
        this.isAdmin = true;
      }
    });

    this.firestoreService
      .getDefinitions('definitions/buildings', 'id')
      .subscribe((buildings: { [key: string]: IBuilding }) => {
        this.buildingsDefinition = buildings;
        this.buildingsToDisplay = Object.keys(this.buildingsDefinition)
      });

    this.firestoreService
      .getMetadata('buildingsMetadata')
      .subscribe((buildingMetadata: { [key: string]: IMetadata }) => {
        this.buildingsMetadata = buildingMetadata;
      });      
  }

  openBuildingEditModal(building: IBuilding, buildingName: string) {
    const modalRef = this.modalService.open(BuildingsModalComponent, {
      centered: true,
      size: 'xl'
    });
    modalRef.componentInstance.buildingData = building; 
    modalRef.componentInstance.buildingName = buildingName;
  }
}

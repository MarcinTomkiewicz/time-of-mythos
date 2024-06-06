import { Component } from '@angular/core';
import { IUser } from '../../../interfaces/general/i-user';
import { AuthService } from '../../../services/auth-service';
import { forkJoin, tap } from 'rxjs';
import { IBuilding } from '../../../interfaces/definitions/i-building';
import { IMetadata } from '../../../interfaces/metadata/i-metadata';
import { FormulasService } from '../../../services/formulas-service';
import { FirestoreService } from '../../../services/firestore-service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-resources-bar',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './resources-bar.component.html',
  styleUrl: './resources-bar.component.css',
})
export class ResourcesBarComponent {
  user: IUser | null = null;
  userUid: string | null = null;
  buildingsData!: IBuilding[];
  buildingsDefinition!: { [key: string]: IBuilding };
  buildingsMetadata!: { [key: string]: IMetadata };
  buildingIcons: { [key: string]: string } = {};
  buildingsKeys: string[] = [];
  heroBuildings!: { [key: string]: number };
  heroBuildingsKeys: string[] = [];
  resourcesMetadata!: { [key: string]: IMetadata };
  resourceKeys: string[] = [];
  heroResources!: { [key: string]: number };
  resourcesGrowth: { [key: string]: number } = {};

  constructor(
    private authService: AuthService,
    public firestoreService: FirestoreService,
    private formulasService: FormulasService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.userUid = this.authService.getUserUID();
      this.user = user;

      if (this.user && this.userUid) {
        forkJoin({
          resourcesMetadata:
            this.firestoreService.getMetadata('resourcesMetadata'),
          buildingsMetadata:
            this.firestoreService.getMetadata('buildingsMetadata'),
          buildingsData: this.firestoreService.getDefinitions(
            'definitions/buildings',
            'id'
          ),
          heroBuildings: this.firestoreService.getHeroData<{
            [key: string]: number;
          }>(this.userUid, 'heroBuildings'),
          heroResources: this.firestoreService.getHeroData<{
            [key: string]: number;
          }>(this.userUid, 'heroResources'),
        }).subscribe({
          next: (data) => {
            this.resourcesMetadata = data.resourcesMetadata;
            this.resourceKeys = Object.keys(this.resourcesMetadata);

            this.heroResources = data.heroResources;

            this.buildingsMetadata = data.buildingsMetadata;
            this.buildingsKeys = Object.keys(this.buildingsMetadata);

            this.heroBuildings = data.heroBuildings;
            this.heroBuildingsKeys = Object.keys(data.heroBuildings);

            this.buildingsDefinition = data.buildingsData;
            this.buildingsKeys = Object.keys(data.buildingsData);
            this.buildingsData = Object.values(data.buildingsData);
            this.buildingsKeys.forEach((key) => {
              this.firestoreService
                .getDownloadUrl('buildings/' + data.buildingsData[key].icon)
                .subscribe((icon) => {
                  this.buildingIcons[key] = icon;
                });
            });

            this.calculateResourcesGrowth();
          },
          error: (error) => {
            console.error('Error loading data:', error);
          },
        });
      }
    });
  }

  calculateResourcesGrowth(): void {
    if (!this.buildingsDefinition) return;
    const agoraLevel = this.heroBuildings['agora'] || 0;
    const lumberMillLevel = this.heroBuildings['lumberMill'] || 0;
    const farmLevel = this.heroBuildings['farm'] || 0;

    this.resourcesGrowth['drachma'] =
      this.formulasService.calculateBonusFormula(
        this.buildingsDefinition['agora'].bonusFormula,
        this.buildingsDefinition['agora'].bonuses,
        agoraLevel - 1
      )[0].value;
    this.resourcesGrowth['materials'] =
      this.formulasService.calculateBonusFormula(
        this.buildingsDefinition['lumberMill'].bonusFormula,
        this.buildingsDefinition['lumberMill'].bonuses,
        lumberMillLevel - 1
      )[0].value;
    this.resourcesGrowth['workforce'] =
      this.formulasService.calculateBonusFormula(
        this.buildingsDefinition['farm'].bonusFormula,
        this.buildingsDefinition['farm'].bonuses,
        farmLevel - 1
      )[0].value;
  }

  log(data: any) {
    console.log(data);
  }
}

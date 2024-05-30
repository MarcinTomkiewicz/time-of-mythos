import { Component } from '@angular/core';
import { IBuilding } from '../../../interfaces/definitions/i-building';
import { IMetadata } from '../../../interfaces/metadata/i-metadata';
import { IUser } from '../../../interfaces/general/i-user';
import { AuthService } from '../../../services/auth-service';
import { FirestoreService } from '../../../services/firestore-service';
import { forkJoin } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { FormulasService } from '../../../services/formulas-service';

@Component({
  selector: 'app-hero-buildings',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './hero-buildings.component.html',
  styleUrl: './hero-buildings.component.css',
})
export class HeroBuildingsComponent {
  buildingsDefinition!: { [key: string]: IBuilding };
  buildingsToDisplay: string[] = [];
  heroBuildings!: { [key: string]: number };
  user: IUser | null = null;
  userUid: string | null = null;
  isLoggedIn: boolean = false;
  buildingName: string = '';
  buildingsData!: IBuilding[];
  resourcesMetadata!: { [key: string]: IMetadata };
  attributesMetadata!: { [key: string]: IMetadata };
  bonusesMetadata!: { [key: string]: IMetadata };
  buildingsMetadata!: { [key: string]: IMetadata };
  resourceKeys: string[] = [];
  attributesKeys: string[] = [];
  bonusesKeys: string[] = [];
  buildingsKeys: string[] = [];
  heroBuildingsKeys: string[] = [];

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private formulasService: FormulasService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.userUid = this.authService.getUserUID();

      this.user = user;

      if (this.user && this.userUid) {
        forkJoin({
          resources: this.firestoreService.getMetadata('resourcesMetadata'),
          attributes: this.firestoreService.getMetadata('attributesMetdata'),
          bonuses: this.firestoreService.getMetadata('bonusesMetadata'),
          buildings: this.firestoreService.getMetadata('buildingsMetadata'),
        }).subscribe({
          next: (data) => {
            this.resourcesMetadata = data.resources;
            this.resourceKeys = Object.keys(this.resourcesMetadata);

            this.attributesMetadata = data.attributes;
            this.attributesKeys = Object.keys(this.attributesMetadata);

            this.bonusesMetadata = data.bonuses;
            this.bonusesKeys = Object.keys(this.bonusesMetadata);

            this.buildingsMetadata = data.buildings;
            this.buildingsKeys = Object.keys(this.buildingsMetadata);
          },
          error: (error) => {
            console.error('Error loading metadata:', error);
          },
        });
        this.firestoreService
          .getHeroData<{ [key: string]: number }>(this.userUid, 'heroBuildings')
          .subscribe(buildings => {
            this.heroBuildings = buildings;
            this.heroBuildingsKeys = Object.keys(buildings);
          });
      }
      this.firestoreService.getDefinitions('definitions/buildings', 'id').subscribe(buildingsDefinition => {
        this.buildingsDefinition = buildingsDefinition;
        this.buildingsKeys = Object.keys(buildingsDefinition)
        this.buildingsData = Object.values(buildingsDefinition)
      });     
    });
  }
  
    calculateBuildTime(building: IBuilding, level: number): string {
      return this.formulasService.calculateBuildTimeFormula(
        building.buildTimeFormula,
        building.buildTime,
        level
      ).toString();
    }
    calculateBonuses(building: IBuilding, level: number): string {
      const bonuses = this.formulasService.calculateBonusFormula(
        building.bonusFormula,
        building.bonuses,
        level
      );
      return this.formatAsText(bonuses, this.bonusesMetadata);
    }
  
    calculateRequirements(building: IBuilding, level: number): string {
      const requirements = this.formulasService.calculateRequirementsFormula(
        building.requirementFormula,
        building.requirements,
        level
      );
      return this.formatAsText(requirements, this.buildingsMetadata);
    }
  
    calculateCost(building: IBuilding, level: number): string {
      const cost = this.formulasService.calculateCostFormula(
        building.costFormula,
        building.cost,
        level
      );
      return this.formatAsText(cost, this.resourcesMetadata);
    }

  formatAsText(data: any[], metadata: { [key: string]: IMetadata }): string {
    return data.map(item => {
      const key = Object.keys(item)[0];
      const value = item[key];
      const displayName = metadata[key]?.displayName || key;
      return `<strong>${displayName}:</strong> ${value}`;
    }).join(', ').replace(/,\s*$/, '.');
  }
}

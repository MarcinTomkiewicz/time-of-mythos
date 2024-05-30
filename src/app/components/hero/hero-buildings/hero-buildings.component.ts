import { Component } from '@angular/core';
import { IBuilding } from '../../../interfaces/definitions/i-building';
import { IMetadata } from '../../../interfaces/metadata/i-metadata';
import { IUser } from '../../../interfaces/general/i-user';
import { AuthService } from '../../../services/auth-service';
import { FirestoreService } from '../../../services/firestore-service';
import { forkJoin } from 'rxjs';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormulasService } from '../../../services/formulas-service';

@Component({
  selector: 'app-hero-buildings',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule],
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
  requirementsMetadata!: { [key: string]: IMetadata };
  resourceKeys: string[] = [];
  attributesKeys: string[] = [];
  bonusesKeys: string[] = [];
  buildingsKeys: string[] = [];
  requirementsKeys: string[] = [];
  heroBuildingsKeys: string[] = [];
  buildingIcons: { [key: string]: string } = {};

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
          resources: this.firestoreService.getMetadata('resourcesMetadata'),
          attributes: this.firestoreService.getMetadata('attributesMetdata'),
          bonuses: this.firestoreService.getMetadata('bonusesMetadata'),
          buildings: this.firestoreService.getMetadata('buildingsMetadata'),
          requirements: this.firestoreService.getMetadata('requirementsMetadata'),
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

            this.requirementsMetadata = data.requirements;
            this.requirementsKeys = Object.keys(this.requirementsMetadata);
            
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
        this.buildingsKeys.forEach(key => {
          this.firestoreService.getDownloadUrl('buildings/' + buildingsDefinition[key].icon).subscribe(icon => {
            this.buildingIcons[key] = icon;                       
          });
        });
      });   
      });  
    };
  
  
    calculateBuildTime(building: IBuilding, level: number): string {
      const buildTimeSeconds = this.formulasService.calculateBuildTimeFormula(
        building.buildTimeFormula,
        building.buildTime,
        level
      );
    
      if (buildTimeSeconds < 60) {
        return buildTimeSeconds.toString() + " s";
      } else if (buildTimeSeconds < 3600) {
        const minutes = Math.floor(buildTimeSeconds / 60);
        const seconds = buildTimeSeconds % 60;
        return `${minutes} m ${seconds} s`;
      } else if (buildTimeSeconds < 86400) {
        const hours = Math.floor(buildTimeSeconds / 3600);
        const minutes = Math.floor((buildTimeSeconds % 3600) / 60);
        const seconds = buildTimeSeconds % 60;
        return `${hours} h ${minutes} m ${seconds} s`;
      } else {
        const days = Math.floor(buildTimeSeconds / 86400);
        const hours = Math.floor((buildTimeSeconds % 86400) / 3600);
        const minutes = Math.floor((buildTimeSeconds % 3600) / 60);
        const seconds = buildTimeSeconds % 60;
        return `${days} d ${hours} h ${minutes} m ${seconds} s`;
      }
    }
    
    
    calculateBonuses(building: IBuilding, level: number): string {
      const bonuses = this.formulasService.calculateBonusFormula(
        building.bonusFormula,
        building.bonuses,
        level - 1
      );
      return this.formatAsText(bonuses, this.bonusesMetadata);
    }
    
    calculateRequirements(building: IBuilding, level: number): string {
      const requirements = this.formulasService.calculateRequirementsFormula(
        building.requirementFormula,
        building.requirements,
        level
      );
      return this.formatAsText(requirements, this.requirementsMetadata, 'requirement');
    }
  
    calculateCost(building: IBuilding, level: number): string {
      const costs = this.formulasService.calculateCostFormula(
        building.costFormula,
        building.cost,
        level
      );
      return this.formatAsText(costs, this.resourcesMetadata, 'cost');
    }
  

    formatAsText(
      items: any[],
      metadata: { [key: string]: IMetadata },
      type: 'bonus' | 'cost' | 'requirement' = 'bonus'
    ): string {
      return items.map(item => {
        let displayName = '';
        let value = '';
  
        if (type === 'bonus') {
          displayName = metadata[item.type]?.displayName || item.type;
          value = item.value;
        } else if (type === 'cost') {
          displayName = this.resourcesMetadata[item.resource]?.displayName || item.resource;
          value = item.amount;
        } else if (type === 'requirement') {
          if (item.type === 'heroLevel') {
            displayName = this.requirementsMetadata[item.type]?.displayName || item.type;
            value = item.value;
          } else if (item.type === 'heroStat') {
            displayName = this.attributesMetadata[item.stat]?.displayName || item.stat;
            value = item.value;
          } else if (item.type === 'building') {
            displayName = this.buildingsMetadata[item.buildingId]?.displayName || item.buildingId;
            value = item.level;
          }
        }
  
        return `<b>${displayName}:</b> ${value}`;
      }).join(', ') + '.';
    }
  
}

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { IHeroData } from '../../interfaces/hero/i-hero-data';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { IAttributesDefinition } from '../../interfaces/definitions/i-attributes';
import { IMetadata } from '../../interfaces/metadata/i-metadata';
import { FirestoreService } from '../../services/firestore-service';
import { AuthService } from '../../services/auth-service';
import { IUser } from '../../interfaces/general/i-user';
import { NgFor, NgIf } from '@angular/common';
import { FormulasService } from '../../services/formulas-service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-attributes-panel',
  standalone: true,
  imports: [NgFor, NgIf, NgbTooltip],
  templateUrl: './attributes-panel.component.html',
  styleUrl: './attributes-panel.component.css',
})
export class AttributesPanelComponent implements OnInit {
  @Input() newHeroData!: IHeroData;
  @Input() newHeroStats!: IHeroStats;
  @Input() attributesDefinitions!: { [key: string]: IAttributesDefinition };
  @Input() attributesMetadata!: { [key: string]: IMetadata };
  @Input() heroDataMetadata!: { [key: string]: IMetadata };
  @Input() attributesToDisplay: string[] = [];

  heroData!: IHeroData;
  heroStats!: IHeroStats;

  user: IUser | null = null;
  userUid: string | null = null;
  isLoggedIn: boolean = false;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private formulasService: FormulasService
  ) {}

  ngOnInit(): void {
    this.userUid = this.authService.getUserUID();

    this.authService.loggedIn$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
    });

    this.authService.getUser().subscribe((user: IUser | null) => {
      this.user = user;

      if (this.userUid && this.user) {
        this.loadHeroData(this.userUid);
        this.loadAttributesData(this.userUid);
      } else {
        this.heroData = { ...this.newHeroData };
        this.heroStats = { ...this.newHeroStats };
      }
    });
  }

  loadHeroData(userId: string): void {
    this.firestoreService.getHeroData(userId).subscribe((heroData) => {
      this.heroData = heroData;
    });
  }

  loadAttributesData(userId: string): void {
    this.firestoreService.getAttributesData(userId).subscribe((heroStats) => {
      this.heroStats = heroStats;
    });
  }

  getAttributeValue(attribute: string): number {
    return this.heroStats[attribute as keyof IHeroStats];
  }

  calculateCostForAttribute(attributeLevel: number): number {   
    return this.formulasService.calculateAttributeCost(attributeLevel);
  }

  increaseAttribute(attribute: string): void {
    if (this.heroStats[attribute as keyof IHeroStats] !== undefined) {
      const increaseCost = this.calculateCostForAttribute(this.heroStats[attribute as keyof IHeroStats]);
      if (this.heroData.dpPoints >= increaseCost) {
        this.heroStats[attribute as keyof IHeroStats]++;
        
        
        this.heroData.dpPoints -= increaseCost;
      }
    }
  }

  decreaseAttribute(attribute: string): void {
    if (this.heroStats[attribute as keyof IHeroStats] !== undefined && this.heroStats[attribute as keyof IHeroStats] > 0) {
      const increaseCost = this.calculateCostForAttribute(this.heroStats[attribute as keyof IHeroStats] - 1);
      if (this.heroData.dpPoints + increaseCost <= this.newHeroData.dpPoints) {
        this.heroStats[attribute as keyof IHeroStats]--;
        this.heroData.dpPoints += increaseCost;
      }
    }
  }

  log(data: any): void {
    console.log(data);
  }
}

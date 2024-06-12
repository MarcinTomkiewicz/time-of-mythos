import { Component, OnInit } from '@angular/core';
import { IHeroData } from '../../../interfaces/hero/i-hero-data';
import { IHeroStats } from '../../../interfaces/hero/i-hero-stats';
import { IAttributesDefinition } from '../../../interfaces/definitions/i-attributes';
import { IMetadata } from '../../../interfaces/metadata/i-metadata';
import { FirestoreService } from '../../../services/firestore-service';
import { AuthService } from '../../../services/auth-service';
import { IUser } from '../../../interfaces/general/i-user';
import { NgFor, NgIf } from '@angular/common';
import { FormulasService } from '../../../services/formulas-service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-attributes-panel',
  standalone: true,
  imports: [NgFor, NgIf, NgbTooltip],
  templateUrl: './attributes-panel.component.html',
  styleUrl: './attributes-panel.component.css',
})
export class AttributesPanelComponent implements OnInit {
  attributesDefinitions!: { [key: string]: IAttributesDefinition };
  attributesMetadata!: { [key: string]: IMetadata };
  heroDataMetadata!: { [key: string]: IMetadata };
  attributesToDisplay: string[] = [];

  heroData!: IHeroData;
  heroStats!: IHeroStats;

  initialHeroData!: IHeroData;
  initialHeroStats!: IHeroStats;

  user: IUser | null = null;
  userUid: string | null = null;
  isLoggedIn: boolean = false;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private formulasService: FormulasService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.userUid = this.authService.getUserUID();

      this.user = user;
      if (this.userUid && this.user) {
        this.loadHeroData(this.userUid);
        this.loadAttributesData(this.userUid);
      }
    });

    this.firestoreService
      .getDefinitions('definitions/attributes', 'id')
      .subscribe((attributesDefinition) => {
        this.attributesDefinitions = attributesDefinition;
        this.attributesToDisplay = Object.keys(this.attributesDefinitions);
      });

    this.firestoreService
      .getMetadata('attributesMetdata')
      .subscribe((attributesMetadata) => {
        this.attributesMetadata = attributesMetadata;
      });

    this.firestoreService
      .getMetadata('heroDataMetadata')
      .subscribe((heroDataMetadata) => {
        this.heroDataMetadata = heroDataMetadata;
      });
  }

  loadHeroData(userId: string): void {
    this.firestoreService
      .getHeroData<IHeroData>(userId, 'heroData')
      .subscribe((heroData: IHeroData) => {
        this.initialHeroData = { ...heroData };
        this.heroData = heroData;
      });
  }

  loadAttributesData(userId: string): void {
    this.firestoreService
      .getHeroData<IHeroStats>(userId, 'heroAttributes')
      .subscribe((heroStats: IHeroStats) => {
        this.initialHeroStats = { ...heroStats };
        this.heroStats = heroStats;
      });
  }

  getAttributeValue(attribute: string): number {
    return this.heroStats[attribute as keyof IHeroStats] ?? 0;
  }

  calculateCostForAttribute(attributeLevel: number): number {
    return this.formulasService.calculateAttributeCost(attributeLevel);
  }

  increaseAttribute(attribute: string): void {
    if (this.heroStats[attribute as keyof IHeroStats] !== undefined) {
      const increaseCost = this.calculateCostForAttribute(
        this.heroStats[attribute as keyof IHeroStats]
      );
      if (this.heroData.dpPoints >= increaseCost) {
        this.heroStats[attribute as keyof IHeroStats]++;
        this.heroData.dpPoints -= increaseCost;
      }
    }
  }

  decreaseAttribute(attribute: string): void {
    // Sprawdź, czy atrybut istnieje w danych bohatera i czy jego poziom jest większy niż 0
    if (
      this.heroStats[attribute as keyof IHeroStats] !== undefined &&
      this.heroStats[attribute as keyof IHeroStats] > 0
    ) {
      // Oblicz koszt zmniejszenia atrybutu o 1 poziom
      const decreaseCost = this.calculateCostForAttribute(
        this.heroStats[attribute as keyof IHeroStats] - 1
      );
      // Sprawdź, czy bohater ma wystarczająco punktów doświadczenia, aby zmniejszyć atrybut

      if (
        this.heroStats[attribute as keyof IHeroStats] >
        this.initialHeroStats[attribute as keyof IHeroStats]
      ) {
        // Zmniejsz poziom atrybutu o 1
        this.heroStats[attribute as keyof IHeroStats]--;
        // Oddaj punkty doświadczenia bohatera
        this.heroData.dpPoints += decreaseCost;
      }
    }
  }

  resetChanges(): void {
    // Przywróć początkowe wartości atrybutów
    this.heroStats = { ...this.initialHeroStats };

    // Przywróć początkową liczbę punktów doświadczenia
    this.heroData.dpPoints = this.initialHeroData.dpPoints;
  }

  updateAttributes(): void {
    if (!this.userUid) return;

    this.firestoreService
      .updateData(this.userUid, 'heroData', {
        dpPoints: this.heroData.dpPoints,
      })
      .subscribe(() => {
        if (!this.userUid) return;
        this.loadHeroData(this.userUid);
      });

    this.firestoreService
      .updateData(this.userUid, 'heroAttributes', this.heroStats)
      .subscribe(() => {
        if (!this.userUid) return;

        this.loadAttributesData(this.userUid);
      });
  }

  log(data: any): void {
    console.log(data);
  }
}

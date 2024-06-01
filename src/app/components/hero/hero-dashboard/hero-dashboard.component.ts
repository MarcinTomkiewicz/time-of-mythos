import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../interfaces/general/i-user';
import { AuthService } from '../../../services/auth-service';
import { FirestoreService } from '../../../services/firestore-service';
import { FormulasService } from '../../../services/formulas-service';
import { IMetadata } from '../../../interfaces/metadata/i-metadata';
import { IAttributesDefinition } from '../../../interfaces/definitions/i-attributes';
import { IHeroData } from '../../../interfaces/hero/i-hero-data';
import { IHeroStats } from '../../../interfaces/hero/i-hero-stats';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { IOriginsDefinition } from '../../../interfaces/definitions/i-origins';

@Component({
  selector: 'app-hero-dashboard',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './hero-dashboard.component.html',
  styleUrl: './hero-dashboard.component.css',
})
export class HeroDashboardComponent implements OnInit {
  user: IUser | null = null;
  userUid: string | null = null;
  attributesDefinitions!: { [key: string]: IAttributesDefinition };
  originsDefinitions!: { [key: string]: IOriginsDefinition };
  attributesMetadata!: { [key: string]: IMetadata };
  originsMetadata!: { [key: string]: IMetadata };
  heroDataMetadata!: { [key: string]: IMetadata };
  ranksMetadata!: { [key: string]: IMetadata };

  heroData!: IHeroData;
  heroStats!: IHeroStats;

  attributesKeys: string[] = [];
  heroKeys: string[] = [];
  originsKeys: string[] = [];
  ranksKeys: string[] = [];

  originImageUrl: string | null = null;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private formulasService: FormulasService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().pipe(
      tap((user: IUser | null) => {
        this.user = user;
        this.userUid = this.authService.getUserUID();
      }),
      switchMap((user: IUser | null) => {
        if (user && this.userUid) {
          return forkJoin({
            attributesMetadata: this.firestoreService.getMetadata<IMetadata>('attributesMetdata'),
            heroDataMetadata: this.firestoreService.getMetadata<IMetadata>('heroDataMetadata'),
            originsMetadata: this.firestoreService.getMetadata<IMetadata>('originsMetadata'),
            ranksMetadata: this.firestoreService.getMetadata<IMetadata>('ranksMetadata'),
            originsDefinitions: this.firestoreService.getDefinitions('definitions/origins', 'id'),
            attributesDefinitions: this.firestoreService.getDefinitions('definitions/attributes', 'id'),
            heroData: this.firestoreService.getHeroData<IHeroData>(this.userUid, 'heroData'),
            heroStats: this.firestoreService.getHeroData<IHeroStats>(this.userUid, 'heroAttributes'),
          });
        } else {
          return of(null);
        }
      })
    ).subscribe((data) => {
      if (data) {
        this.attributesMetadata = data.attributesMetadata;
        this.attributesDefinitions = data.attributesDefinitions
        this.attributesKeys = Object.keys(this.attributesDefinitions);

        this.originsMetadata = data.originsMetadata;
        this.originsKeys = Object.keys(this.originsMetadata);

        this.ranksMetadata = data.ranksMetadata;
        this.ranksKeys = Object.keys(this.ranksMetadata);

        this.originsDefinitions = data.originsDefinitions;

        this.heroDataMetadata = data.heroDataMetadata;
        this.heroKeys = Object.keys(this.heroDataMetadata);

        this.heroData = data.heroData;

        this.heroStats = data.heroStats;

        if (this.heroData.originId) {
          this.firestoreService.getDownloadUrl(`origins/${this.heroData.originId}.jpeg`).pipe(
            tap((url) => {
              this.originImageUrl = url;
            }),
            catchError((error) => {
              console.error('Error fetching origin image URL:', error);
              return of(null);
            })
          ).subscribe();
        }
      }
    });
  }

  displayHeroStats(key: string): number {
    return this.heroStats[key as keyof IHeroStats];
  }

  getOriginDisplayName(originId: string): string {
    return this.originsMetadata[originId]?.displayName || 'Unknown Origin';
  }
}

import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore-service';

@Injectable({
  providedIn: 'root',
})
export class OriginService {

  constructor(private firestoreService: FirestoreService) {}

getOriginBonus(definition: any, originName: string, attributesMetadata: any, heroDataMetadata: any): { stat: string; bonus: number }[] {
    const bonuses = definition[originName]?.originBonus ?? {};
    const stats = Object.keys(attributesMetadata);
    const heroStats = Object.keys(heroDataMetadata);

    const bonusArray: { stat: string; bonus: number }[] = [];
    stats.forEach((stat) => {       
        if (bonuses[stat] !== undefined && bonuses[stat] !== 0) {
            bonusArray.push({
                stat: attributesMetadata[stat].displayName,
                bonus: bonuses[stat],
            });
        }
    });

    heroStats.forEach((heroStat) => {
        if (bonuses[heroStat] !== undefined && bonuses[heroStat] !== 0) {
            bonusArray.push({
                stat: heroDataMetadata[heroStat].displayName,
                bonus: bonuses[heroStat],
            });
        }
    });

    return bonusArray;
  }
}
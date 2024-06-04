import { Injectable } from '@angular/core';
import {
  IBuildingRequirement,
  IHeroLevelRequirement,
  IHeroStatRequirement,
  IRequirement,
} from '../interfaces/definitions/i-requirements';
import * as math from 'mathjs';
import { ICost } from '../interfaces/definitions/i-building';
import { IBonus } from '../interfaces/definitions/i-bonus';

@Injectable({
  providedIn: 'root',
})
export class FormulasService {
  constructor() {}

  calculateAttributeCost(attributeLevel: number): number {
    let cost: number = 0;

    cost = Math.ceil(
      0.03 * Math.pow(attributeLevel, 1.5) + 0.8 * Math.pow(attributeLevel, 1.9)
    );

    return cost > 0 ? cost : 1;
  }

  calculateCostFormula(formula: string, base: ICost[], level: number): ICost[] {
    let resultDataArray: ICost[] = [];
  
    for (let item of base) {
      let baseAmount = item.amount;
  
      let convertedFormula = formula
        .replaceAll(/baseCost/g, baseAmount.toString())
        .replaceAll(/level/g, level.toString());
  
      let newAmount = Math.max(1, Math.floor(math.evaluate(convertedFormula))); // Zabezpieczenie, że wartość wynikowa będzie przynajmniej 1
  
      resultDataArray.push({
        amount: newAmount,
        resource: item.resource,
      });
    }
  
    return resultDataArray;
  }
  
  calculateBuildTimeFormula(formula: string, baseBuildTime: number, level: number): number {
    let convertedFormula = formula
      .replaceAll(/baseBuildTime/g, baseBuildTime.toString())
      .replaceAll(/level/g, level.toString());
    let result = Math.max(1, Math.floor(math.evaluate(convertedFormula))); // Zabezpieczenie, że wartość wynikowa będzie przynajmniej 1
  
    return result;
  }
  
  calculateRequirementsFormula(formula: string, base: IRequirement[], level: number): IRequirement[] {
    return base?.map((item) => {
      let newItem = { ...item };
      
      if ((item as IBuildingRequirement).type === 'building') {
        let buildingRequirement = item as IBuildingRequirement;
        let convertedFormula = formula
          .replaceAll(/baseRequirement/g, buildingRequirement.level.toString())
          .replaceAll(/level/g, level.toString());
        let newLevel = Math.max(1, Math.floor(math.evaluate(convertedFormula))); // Zabezpieczenie, że wartość wynikowa będzie przynajmniej 1
        (newItem as IBuildingRequirement).level = newLevel;
      } else if (
        (item as IHeroStatRequirement).type === 'heroStat' ||
        (item as IHeroLevelRequirement).type === 'heroLevel'
      ) {
        let valueRequirement = item as IHeroStatRequirement | IHeroLevelRequirement;
        let baseValue = valueRequirement.value;
        let convertedFormula = formula
          .replaceAll(/baseRequirement/g, baseValue.toString())
          .replaceAll(/level/g, level.toString());
        let newValue = Math.max(1, Math.floor(math.evaluate(convertedFormula))); // Zabezpieczenie, że wartość wynikowa będzie przynajmniej 1
        (newItem as IHeroStatRequirement | IHeroLevelRequirement).value = newValue;
      }
  
      return newItem;
    });
  }
  
  calculateBonusFormula(formula: string, baseBonus: IBonus[], level: number): IBonus[] {
    let resultDataArray: IBonus[] = [];
  
    for (let bonus of baseBonus) {
      let baseBonusValue = bonus.value;
  
      let convertedFormula = formula
        .replaceAll(/baseBonus/g, baseBonusValue.toString())
        .replaceAll(/level/g, level.toString());

        
        
        let newBonusValue = Math.max(1, Math.floor(math.evaluate(convertedFormula)));
        
        console.log(math.evaluate(convertedFormula), baseBonusValue, newBonusValue);
      resultDataArray.push({
        ...bonus,
        value: newBonusValue,
      });
    }
  
    return resultDataArray;
  }
}

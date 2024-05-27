import { Injectable } from '@angular/core';
import { IHeroLevelRequirement, IHeroStatRequirement, IRequirement } from '../interfaces/definitions/i-requirements';
import * as math from 'mathjs';

@Injectable({
  providedIn: 'root'
})
export class FormulasService {

  constructor() { }

  calculateAttributeCost(attributeLevel: number): number {
    let cost: number = 0;

      cost = Math.ceil(0.03 * Math.pow(attributeLevel, 1.5) + 0.8 * Math.pow(attributeLevel, 1.9));

    return cost > 0 ? cost : 1;
  }

  calculateRequirements(formula: string, level: number, inputRequirementsData: IRequirement[]): IRequirement[] {
    const resultRequirements: IRequirement[] = [];

    for (const inputRequirement of inputRequirementsData) {
      switch (inputRequirement.type) {
        case 'building':
          resultRequirements.push(inputRequirement);
          break;
        case 'heroStat':
          const heroStatRequirement = inputRequirement as IHeroStatRequirement;
          const updatedStatValue = this.calculateStatValue(formula, level, heroStatRequirement.value);
          resultRequirements.push({ type: 'heroStat', stat: heroStatRequirement.stat, value: updatedStatValue });
          break;
        case 'heroLevel':
          const heroLevelRequirement = inputRequirement as IHeroLevelRequirement;
          const updatedLevelValue = this.calculateLevelValue(formula, level, heroLevelRequirement.value);
          resultRequirements.push({ type: 'heroLevel', value: updatedLevelValue });
          break;
        default:
          resultRequirements.push(inputRequirement);
          break;
      }
    }

    return resultRequirements;
  }

  private calculateStatValue(formula: string, level: number, baseValue: number): number {
    const substitutedFormula = formula.replace(/BaseStat/g, baseValue.toString());
    const result = math.evaluate(substitutedFormula, { level: level });
    return Number(result);
  }

  private calculateLevelValue(formula: string, level: number, baseValue: number): number {
    const substitutedFormula = formula.replace(/BaseLevel/g, baseValue.toString());
    const result = math.evaluate(substitutedFormula, { level: level });
    return Number(result);
  }

}
import { Injectable } from '@angular/core';
import {
  IBuildingRequirement,
  IHeroLevelRequirement,
  IHeroStatRequirement,
  IRequirement,
} from '../interfaces/definitions/i-requirements';
import * as math from 'mathjs';
import { ICost } from '../interfaces/definitions/i-building';

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

  calculateRequirements(
    formula: string,
    level: number,
    inputRequirementsData: IRequirement[]
  ): IRequirement[] {
    const resultRequirements: IRequirement[] = [];

    for (const inputRequirement of inputRequirementsData) {
      switch (inputRequirement.type) {
        case 'building':
          resultRequirements.push(inputRequirement);
          break;
        case 'heroStat':
          const heroStatRequirement = inputRequirement as IHeroStatRequirement;
          const updatedStatValue = this.calculateStatValue(
            formula,
            level,
            heroStatRequirement.value
          );
          resultRequirements.push({
            type: 'heroStat',
            stat: heroStatRequirement.stat,
            value: updatedStatValue,
          });
          break;
        case 'heroLevel':
          const heroLevelRequirement =
            inputRequirement as IHeroLevelRequirement;
          const updatedLevelValue = this.calculateLevelValue(
            formula,
            level,
            heroLevelRequirement.value
          );
          resultRequirements.push({
            type: 'heroLevel',
            value: updatedLevelValue,
          });
          break;
        default:
          resultRequirements.push(inputRequirement);
          break;
      }
    }

    return resultRequirements;
  }

  private calculateStatValue(
    formula: string,
    level: number,
    baseValue: number
  ): number {
    const substitutedFormula = formula.replace(
      /BaseStat/g,
      baseValue.toString()
    );
    const result = math.evaluate(substitutedFormula, { level: level });
    return Number(result);
  }

  private calculateLevelValue(
    formula: string,
    level: number,
    baseValue: number
  ): number {
    const substitutedFormula = formula.replace(
      /BaseLevel/g,
      baseValue.toString()
    );
    const result = math.evaluate(substitutedFormula, { level: level });
    return Number(result);
  }

  calculateCostFormula(formula: string, base: ICost[], level: number): ICost[] {
    let resultDataArray: ICost[] = [];

    for (let item of base) {
      let baseAmount = item.amount;

      let convertedFormula = formula
        .replaceAll(/baseCost/g, baseAmount.toString())
        .replaceAll(/level/g, level.toString());

      let newAmount = math.evaluate(convertedFormula);

      resultDataArray.push({
        amount: newAmount,
        resource: item.resource,
      });
    }

    console.log(resultDataArray);

    return resultDataArray;
  }

  calculateRequirementsFormula(
    formula: string,
    base: IRequirement[],
    level: number
  ): IRequirement[] {
    return base?.map((item) => {
      let newItem = { ...item };

      if ((item as IBuildingRequirement).type === 'building') {
        let buildingRequirement = item as IBuildingRequirement;
        let convertedFormula = formula
          .replaceAll(/baseRequirement/g, buildingRequirement.level.toString())
          .replaceAll(/level/g, level.toString());
        let newLevel = math.evaluate(convertedFormula);
        (newItem as IBuildingRequirement).level = newLevel;
      } else if (
        (item as IHeroStatRequirement).type === 'heroStat' ||
        (item as IHeroLevelRequirement).type === 'heroLevel'
      ) {
        let valueRequirement = item as
          | IHeroStatRequirement
          | IHeroLevelRequirement;
        let baseValue = valueRequirement.value;
        let convertedFormula = formula
          .replaceAll(/baseRequirement/g, baseValue.toString())
          .replaceAll(/level/g, level.toString());
        let newValue = math.evaluate(convertedFormula);
        (newItem as IHeroStatRequirement | IHeroLevelRequirement).value =
          newValue;
      }

      return newItem;
    });
  }
}

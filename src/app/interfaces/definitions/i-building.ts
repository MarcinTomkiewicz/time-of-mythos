
import { IBonus } from './i-bonus';
import { IRequirement } from './i-requirements';
import { ResourceType } from './i-resources';

export interface IBuilding {
  id: number;
  cost: ICost[];
  buildTime: number;
  requirements: IRequirement[];
  bonuses: IBonus[];
  costFormula: string;
  buildTimeFormula: string;
  requirementFormula: string;
  bonusFormula: string;
  minPlayerHierarchyLevel: number;
  maxBuildingLevel: number;
  icon: string;
}

export interface ICost {
  resource: ResourceType;
  amount: number;
}

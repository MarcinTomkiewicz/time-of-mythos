import { IBonus } from "./i-bonus";
import { IRequirement } from "./i-requirements";

export interface IItem {
    id: number;
    name: string;
    type: string;
    isSetItem: boolean;
    setName?: string;
    requirements: IRequirement[];
    bonuses: IBonus[] | null;
    value: number;
    icon?: string;
  }

  export interface IWeapon extends IItem {
    minDamage: number,
    maxDamage: number,
  }

  export interface IArmor extends IItem {
    defense: number
  }

  export interface IPrefix {
    id: number;
    name: string;
    type: string;
    isPartOfSet: boolean;
    setName?: string;
    requirements: IRequirement[];
    bonuses: IBonus[] | null;
    value: number;
  }

  export interface ISuffix {
    id: number;
    name: string;
    type: string;
    requirements: IRequirement[];
    bonuses: IBonus[] | null;
    value: number;
  }

  export type ItemWithOptionalIcon = IItem | IWeapon | IArmor | (IPrefix & { icon?: string }) | (ISuffix & { icon?: string });
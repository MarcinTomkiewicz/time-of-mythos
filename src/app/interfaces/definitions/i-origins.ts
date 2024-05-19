export interface IOriginBonus {
    [key: string]: number;
  }

export interface IOriginsDefinition {
    id: number;
    originBonus:IOriginBonus;
    originImg: string;
}
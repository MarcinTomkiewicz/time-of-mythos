export interface IOriginBonus {
    [key: string]: number;
  }

export interface IOriginsDefinition {
    originId: number;
    originBonus:IOriginBonus;
    originImg: string;
}
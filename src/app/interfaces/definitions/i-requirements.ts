export interface IBuildingRequirement {
    type: 'building';
    buildingId: string;
    level: number;
  }
  
  export interface IHeroStatRequirement {
    type: 'heroStat';
    stat: string;
    value: number;
  }

  export interface IHeroLevelRequirement {
    type: 'heroLevel';
    value: number;
  }

  export type IRequirement = IBuildingRequirement | IHeroStatRequirement | IHeroLevelRequirement;
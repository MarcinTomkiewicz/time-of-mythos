export interface IBonus {
    type: string;
    value: number;
    resource?: 'drachma' | 'material' | 'workforce'
}
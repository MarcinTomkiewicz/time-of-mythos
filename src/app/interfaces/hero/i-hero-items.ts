export interface IHeroItem {
    id: number;
    type: string;
    quality: 0 | 1 | 2;
    prefix: string | null;
    name: string;
    suffix: string | null;
    totalValue: number;
    isWorn: boolean;
}
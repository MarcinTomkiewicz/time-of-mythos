export interface IHeroData {
    heroName: string;
    xpPoints: number;
    dpPoints: number;
    level: number;
    originId: number;
    hp: number;
    defense: number;
    luck: number;
    allianceID: number;
    getNextLevelExperience?: () => Promise<number>;
}
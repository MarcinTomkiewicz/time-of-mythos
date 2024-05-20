export interface IHeroData {
    heroName: string;
    xpPoints: number;
    dpPoints: number;
    level: number;
    originId: string;
    rankId: string;
    hp: number;
    defense: number;
    luck: number;
    allianceID: number;
    getNextLevelExperience?: () => Promise<number>;
}
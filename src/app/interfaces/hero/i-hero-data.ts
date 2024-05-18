export interface HeroData {
    heroName: string;
    xpPoints: number;
    dpPoints: number;
    level: number;
    getNextLevelExperience?: () => Promise<number>;
}
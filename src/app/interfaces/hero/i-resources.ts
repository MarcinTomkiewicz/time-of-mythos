export interface IResource {
    currentValue: number;
    growthPerHour: number;
}

export interface IHeroResources {
    drachma: IResource;
    material: IResource;
    workforce: IResource;
}
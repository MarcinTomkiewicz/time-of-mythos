import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataProcessingService {
  constructor() {}

  processDefinitions<T extends { id: number }>(
    definitions: { [key: string]: T },
    idKey: string
  ): { [key: string]: T } {
    let definitionsArray = Object.keys(definitions).map((key) => ({
      ...definitions[key],
      [idKey]: definitions[key].id,
      name: key,
    }));

    definitionsArray.sort((a, b) => {
      if (a[idKey] < b[idKey]) return -1;
      if (a[idKey] > b[idKey]) return 1;
      return 0;
    });

    // Konwersja posortowanej tablicy z powrotem na obiekt
    let sortedDefinitions = definitionsArray.reduce((acc: any, definition) => {
      acc[definition.name] = definition;
      return acc;
    }, {});
    return sortedDefinitions;
  }
}

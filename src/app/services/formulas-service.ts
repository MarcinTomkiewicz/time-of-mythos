import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormulasService {

  constructor() { }

  calculateAttributeCost(attributeLevel: number): number {
    let cost: number = 0;

      cost = Math.ceil(0.03 * Math.pow(attributeLevel, 1.5) + 0.8 * Math.pow(attributeLevel, 1.9));

    return cost > 0 ? cost : 1;
  }

}
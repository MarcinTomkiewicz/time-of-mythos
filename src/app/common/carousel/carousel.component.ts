import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OriginService } from '../../services/origin-service';
import { NgFor, NgIf } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [NgFor, NgIf, NgbCarouselModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent implements OnInit{
  @Input() originsToDisplay: any;
  @Input() attributesMetadata: any;
  @Input() heroDataMetadata: any;
  @Input() originsMetadata: any;
  @Input() originsDefinition: any;
  
  @Output() currentIndexChange = new EventEmitter<number>();

  currentIndex = 0;
  imageUrls: string[] = []; 

  onSlideChange() {
    this.currentIndexChange.emit(this.currentIndex);
  }

  constructor(private originService: OriginService) {}

  ngOnInit() {
  //   this.preloadImages();
  }

  // preloadImages() {
  //   this.originsToDisplay.forEach((origin: string) => {
  //     const img = new Image();
  //     img.src = this.originsDefinition[origin]?.originImg;
  //   });
  // }

  getLeftIndex(): number {
    return (this.currentIndex + 1) % this.originsToDisplay.length;
  }

  getRightIndex(): number {
    return (this.currentIndex - 1 + this.originsToDisplay.length) % this.originsToDisplay.length;
  }

  isVisible(index: number): boolean {
    return index === this.currentIndex || index === this.getLeftIndex() || index === this.getRightIndex();
  }

  prev() {
    this.currentIndex = this.getRightIndex();
  }

  next() {
    this.currentIndex = this.getLeftIndex();
  }

  log(data: any): void {
    console.log(data);
  }

  getOriginBonus(): { stat: string; bonus: number }[] {
    const originKey = this.originsToDisplay[this.currentIndex];
    const bonuses = this.originService.getOriginBonus(
      this.originsDefinition,
      originKey,
      this.attributesMetadata,
      this.heroDataMetadata
    );
    return bonuses;
  }

}

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
  @Input() currentIndex = 0;
  
  @Output() currentIndexChange = new EventEmitter<number>();

  imageUrls: string[] = []; 

  // onSlideChange(index: number) {
  //   console.log(index);
      
  //   this.currentIndex = index;
  // }

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
    this.currentIndexChange.emit(this.currentIndex);
  }

  next() {
    this.currentIndex = this.getLeftIndex();
    this.currentIndexChange.emit(this.currentIndex);
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

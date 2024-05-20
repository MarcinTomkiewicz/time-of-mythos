import { Component } from '@angular/core';
import { FormsService } from '../../services/forms-service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { IOriginsDefinition } from '../../interfaces/definitions/i-origins';
import { IMetadata } from '../../interfaces/metadata/i-metadata';
import { FirestoreService } from '../../services/firestore-service';
import { OriginService } from '../../services/origin-service';
import { CarouselComponent } from '../../common/carousel/carousel.component';
import { IHeroData } from '../../interfaces/hero/i-hero-data';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { IUser } from '../../interfaces/general/i-user';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../common/confirmation-modal/confirmation-modal.component';
import { IAttributesDefinition } from '../../interfaces/definitions/i-attributes';
import { AttributesPanelComponent } from '../attributes-panel/attributes-panel.component';

@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor, CarouselComponent, AttributesPanelComponent],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.css',
})
export class CreateCharacterComponent {
  formData: any;
  characterForm: FormGroup;
  originsDefinitions: { [key: string]: IOriginsDefinition } = {};
  attributesDefinitions: { [key: string]: IAttributesDefinition } = {};
  originsMetadata: { [key: string]: IMetadata } = {};
  attributesMetadata: { [key: string]: IMetadata } = {};
  heroDataMetadata: { [key: string]: IMetadata } = {};
  originsToDisplay: string[] = [];
  attributesToDisplay: string[] = [];
  newHeroData: IHeroData;
  newHeroStats: IHeroStats;
  newUserData: IUser;
  originChosen: boolean = false;
  currentIndex: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    public formsService: FormsService,
    public firestoreService: FirestoreService,
    private originService: OriginService,
    private modalService: NgbModal
  ) {
    this.characterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      characterName: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.newHeroData = this.initializeHeroData();
    this.newHeroStats = this.initializeHeroStats();
    this.newUserData = this.initializeUserData();
  }

  ngOnInit(): void {
    this.formData = this.formsService.getFormData();
    if (this.formData) {
      this.characterForm.patchValue(this.formData);
    }

    this.firestoreService
      .getDefinitions('definitions/origins', 'id')
      .subscribe((originsDefinition) => {
        this.originsDefinitions = originsDefinition;
        this.originsToDisplay = Object.keys(this.originsDefinitions);

        for (const key in this.originsDefinitions) {
          this.firestoreService
            .getDownloadUrl(this.originsDefinitions[key].originImg)
            .then((url) => {
              this.originsDefinitions[key].originImg = url;
            });
        }
      });

      this.firestoreService.getDefinitions('definitions/attributes', 'id').subscribe((attributesDefinition) => {
        this.attributesDefinitions = attributesDefinition;
        this.attributesToDisplay = Object.keys(this.attributesDefinitions)
      })

    this.firestoreService
      .getMetadata<IMetadata>('originsMetadata')
      .subscribe((originsMetadata) => {
        this.originsMetadata = originsMetadata;
      });

    this.firestoreService
      .getMetadata<IMetadata>('attributesMetdata')
      .subscribe((attributesMetadata) => {
        this.attributesMetadata = attributesMetadata;
      });

    this.firestoreService
      .getMetadata<IMetadata>('heroDataMetadata')
      .subscribe((heroDataMetadata) => {
        this.heroDataMetadata = heroDataMetadata;
      });
  }

  initializeHeroData(): IHeroData {
    return {
      heroName: '',
      xpPoints: 0,
      dpPoints: 100,
      level: 1,
      originId: 0,
      hp: 0,
      defense: 0,
      luck: 0,
      allianceID: 0,
    };
  }
  initializeHeroStats(): IHeroStats {
    return {
      strength: 1,
      dexterity: 1,
      endurance: 1,
      agility: 1,
      cunning: 1,
      charisma: 1,
      wisdom: 1,
      intelligence: 1,
      spirituality: 1,
    };
  }
  initializeUserData(): IUser {
    return {
      isAdmin: false,
      isOnline: false,
      name: '',
      email: '',
      birthday: new Date(0),
      createdAt: new Date(),
      updatedAt: new Date(),
      profilePictureUrl: '',
      lastLogin: new Date(),
      city: '',
      socialLinks: {
        facebook: '',
        twitter: '',
        linkedIn: '',
        instagram: '',
      },
      bio: '',
    };
  }

  getOriginDisplayName(originName: string): string {
    return this.originsMetadata[originName]?.displayName ?? '';
  }

  getOriginDescription(originName: string): string {
    return this.originsMetadata[originName]?.description ?? '';
  }

  getHeroDataDescription(originName: string): string {
    return this.heroDataMetadata[originName]?.description ?? '';
  }

  getOriginBonus(originName: string): { stat: string; bonus: number }[] {
    return this.originService.getOriginBonus(
      this.originsDefinitions,
      originName,
      this.attributesMetadata,
      this.heroDataMetadata
    );
  }

  getImageUrl(imagePath: string): string {
    const baseUrl =
      'https://firebasestorage.googleapis.com/v0/b/time-of-mythos.appspot.com/o/';
    const encodedPath = encodeURIComponent(imagePath);
    return `${baseUrl}${encodedPath}?alt=media`;
  }

  onCarouselSlideChange(index: number) {
    this.currentIndex = index;
  }

  chooseOrigin() {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true
    });
    modalRef.componentInstance.confirmationQuestion =
      'Are you sure you want to choose this origin?';
    modalRef.componentInstance.confirmationData = 'Selected origin';
    modalRef.componentInstance.selectedOption =
      this.originsMetadata[
        this.originsToDisplay[this.currentIndex]
      ].displayName;
    modalRef.result.then((result) => {
      if (result === 'proceed') {
        this.newHeroData.originId = this.currentIndex + 1;
        this.originChosen = true;
      }
    });
  }

  register(): void {
    if (this.characterForm.valid) {
      // Logika po zatwierdzeniu formularza
      console.log('Formularz zatwierdzony:', this.characterForm.value);
    }
  }
}

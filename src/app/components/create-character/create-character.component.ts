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

@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.css',
})
export class CreateCharacterComponent {
  formData: any;
  characterForm: FormGroup;

  originsDefinitions: { [key: string]: IOriginsDefinition } = {};
  originsMetadata: { [key: string]: IMetadata } = {};
  attributesMetadata: { [key: string]: IMetadata } = {};
  heroDataMetadata: { [key: string]: IMetadata } = {};
  originsToDisplay: any;

  constructor(
    private formBuilder: FormBuilder,
    public formsService: FormsService,
    public firestoreService: FirestoreService
  ) {
    this.characterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      characterName: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit(): void {
    this.formData = this.formsService.getFormData();
    if (this.formData) {
      this.characterForm.patchValue(this.formData);
    }

    this.firestoreService
    .getDefinitions('definitions/origins', 'originId')
    .subscribe(originsDefinition => {
      console.log(originsDefinition);
      
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
    const bonuses = this.originsDefinitions[originName]?.originBonus ?? {};
    const stats = Object.keys(this.attributesMetadata);
    const heroStats = Object.keys(this.heroDataMetadata);

    const bonusArray: { stat: string; bonus: number }[] = [];
    stats.forEach((stat) => {
      if (bonuses[stat] !== undefined && bonuses[stat] !== 0) {
          bonusArray.push({
              stat: this.attributesMetadata[stat].displayName,
              bonus: bonuses[stat],
          });
      }
  });

  heroStats.forEach((heroStat) => {
    console.log(heroStat);
    
      if (bonuses[heroStat] !== undefined && bonuses[heroStat] !== 0) {
          bonusArray.push({
              stat: this.heroDataMetadata[heroStat].displayName,
              bonus: bonuses[heroStat],
          });
      }
  });

  return bonusArray;

    return bonusArray;
  }

  getImageUrl(imagePath: string): string {
    console.log(imagePath);

    const baseUrl =
      'https://firebasestorage.googleapis.com/v0/b/time-of-mythos.appspot.com/o/';
    const encodedPath = encodeURIComponent(imagePath);
    return `${baseUrl}${encodedPath}?alt=media`;
  }

  log(data: any) {
    console.log(data);
  }

  register(): void {
    if (this.characterForm.valid) {
      // Logika po zatwierdzeniu formularza
      console.log('Formularz zatwierdzony:', this.characterForm.value);
    }
  }
}

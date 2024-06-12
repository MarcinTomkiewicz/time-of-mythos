import { Component, ViewEncapsulation } from '@angular/core';
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
import { AttributesPanelComponent } from '../hero/attributes-panel/attributes-panel.component';
import { IHeroBuildings } from '../../interfaces/hero/i-hero-buildings';
import {
  Firestore,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { Observable, defer, from, map, switchMap } from 'rxjs';
import { IHeroResources } from '../../interfaces/hero/i-resources';

@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgFor,
    CarouselComponent,
    AttributesPanelComponent,
  ],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.css',
  encapsulation: ViewEncapsulation.None,
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
  newHeroBuildings: IHeroBuildings;
  newUserData: IUser;
  newHeroResources: IHeroResources;
  originChosen: boolean = false;
  nameChosen: boolean = false;
  currentIndex: number = 0;
  selectedFile!: File;

  constructor(
    private formBuilder: FormBuilder,
    public formsService: FormsService,
    public firestoreService: FirestoreService,
    private originService: OriginService,
    private modalService: NgbModal,
    private firestore: Firestore,
    private auth: Auth,
    private storage: Storage,
    private router: Router
  ) {
    this.characterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      characterName: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', Validators.required],
      birthday: ['', Validators.required],
      city: [''],
      profilePicture: [null],
      facebook: [''],
      twitter: [''],
      linkedIn: [''],
      instagram: [''],
      bio: [''],
    });

    this.newHeroData = this.initializeHeroData();
    this.newHeroStats = this.initializeHeroStats();
    this.newHeroBuildings = this.initializeHeroBuildings();
    this.newUserData = this.initializeUserData();
    this.newHeroResources = this.initializeHeroResources();
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
            .subscribe((url) => {
              this.originsDefinitions[key].originImg = url;
            });
        }
      });

    this.firestoreService
      .getDefinitions('definitions/attributes', 'id')
      .subscribe((attributesDefinition) => {
        this.attributesDefinitions = attributesDefinition;
        this.attributesToDisplay = Object.keys(this.attributesDefinitions);
      });

    this.firestoreService
      .getMetadata('originsMetadata')
      .subscribe((originsMetadata) => {
        this.originsMetadata = originsMetadata;
      });

    this.firestoreService
      .getMetadata('attributesMetdata')
      .subscribe((attributesMetadata) => {
        this.attributesMetadata = attributesMetadata;
      });

    this.firestoreService
      .getMetadata('heroDataMetadata')
      .subscribe((heroDataMetadata) => {
        this.heroDataMetadata = heroDataMetadata;
      });
  }

  initializeHeroData(): IHeroData {
    return {
      heroName: '',
      xpPoints: 100,
      dpPoints: 100,
      level: 1,
      originId: '',
      rankName: 'perioecus',
      rankId: 1,
      minDamage: 1,
      maxDamage: 2,
      hp: 100,
      defense: 10,
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

  initializeHeroBuildings(): IHeroBuildings {
    return {
      agora: 1,
      lumberMill: 1,
      farm: 1,
      tradeRoute: 1,
      armory: 1,
      barracks: 1,
      fortress: 1,
      argyroeides: 0,
      quarry: 0,
      oikia: 0,
      oracle: 0,
      temple: 0,
      port: 0,
      academy: 0,
      gymnasium: 0,
      fountain: 0,
      altar: 0,
      planningHall: 0,
      chamber: 0,
      royalPalace: 0,
    };
  }

  initializeUserData(): IUser {
    return {
      isAdmin: false,
      isOnline: false,
      name: '',
      email: '',
      birthday: new Date(0),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      city: '',
      photoURL: '',
      socialLinks: {
        facebook: '',
        twitter: '',
        linkedIn: '',
        instagram: '',
      },
      bio: '',
    };
  }

  initializeHeroResources(): IHeroResources {
    return {
      drachma: { currentValue: 100, growthPerHour: 10 },
      material: { currentValue: 100, growthPerHour: 10 },
      workforce: { currentValue: 100, growthPerHour: 10 },
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

  currentIndexChange(index: number) {
    this.currentIndex = index;
  }

  chooseOrigin() {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.confirmationQuestion =
      'Are you sure you want to choose this origin?';
    modalRef.componentInstance.confirmationData = 'Selected origin: ';
    modalRef.componentInstance.selectedOption =
      this.originsMetadata[
        this.originsToDisplay[this.currentIndex]
      ].displayName;
    console.log(this.currentIndex);

    modalRef.result.then((result) => {
      if (result === 'proceed') {
        this.newHeroData.originId = this.originsToDisplay[this.currentIndex];
        this.originChosen = true;
      }
    });
  }

  chooseName() {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.confirmationQuestion =
      'Are you sure you want to proceed with this name?';
    modalRef.componentInstance.confirmationData = 'Chosen name: ';
    modalRef.componentInstance.selectedOption =
      this.characterForm.value.characterName;
    modalRef.result.then((result) => {
      if (result === 'proceed') {
        this.newHeroData.heroName = this.characterForm.value.characterName;
        this.nameChosen = true;
      }
    });
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.characterForm.patchValue({
          profilePicture: reader.result,
        });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  register(): void {
    if (this.characterForm.valid) {
      this.newUserData = {
        ...this.newUserData,
        email: this.characterForm.get('email')?.value,
        name: this.characterForm.get('name')?.value,
        birthday: this.characterForm.get('birthday')?.value,
        city: this.characterForm.get('city')?.value,
        createdAt: Timestamp.now(),
        socialLinks: {
          facebook: this.characterForm.get('facebook')?.value,
          twitter: this.characterForm.get('twitter')?.value,
          linkedIn: this.characterForm.get('linkedIn')?.value,
          instagram: this.characterForm.get('instagram')?.value,
        },
        bio: this.characterForm.get('bio')?.value,
      };
    }

    this.createNewHero(
      this.newUserData,
      this.newHeroData,
      this.newHeroStats,
      this.newHeroBuildings,
      this.newHeroResources,
      this.selectedFile
    )
      .pipe(
        switchMap(() =>
          signInWithEmailAndPassword(
            this.auth,
            this.newUserData.email,
            this.characterForm.value.password
          )
        ),
        switchMap(() => {
          this.router.navigate(['/attributes']);
          return from(Promise.resolve());
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Error during registration process:', error);
        },
      });
  }

  createNewHero(
    newUserData: IUser,
    newHeroData: IHeroData,
    newHeroStats: IHeroStats,
    newHeroBuildings: IHeroBuildings,
    newHeroResources: IHeroResources,
    selectedFile: File
  ): Observable<void> {
    return defer(() => {
      // 1. Wyświetl modal
      const modalRef = this.modalService.open(ConfirmationModalComponent, {
        centered: true,
      });
      modalRef.componentInstance.confirmationQuestion = `Do you want to create ${
        this.originsMetadata[newHeroData.originId].displayName
      } with a chosen name?`;
      modalRef.componentInstance.confirmationData = 'Chosen name: ';
      modalRef.componentInstance.selectedOption =
        this.characterForm.value.characterName;

      // Convert modal result to Observable
      return from(modalRef.result);
    }).pipe(
      switchMap((result) => {
        if (result !== 'proceed') {
          throw new Error('User did not confirm the creation');
        }
        // Continue with user registration and hero creation
        return from(
          createUserWithEmailAndPassword(
            this.auth,
            newUserData.email,
            this.characterForm.value.password
          )
        );
      }),
      switchMap((userCredential) => {
        const user = userCredential.user;
        if (!user) {
          throw new Error('No user returned from Firebase Auth');
        }
        const userId = user.uid;

        const batch = writeBatch(this.firestore);

        const userNameRef = doc(this.firestore, 'names/userNames');
        updateDoc(userNameRef, { ['names']: newUserData.name });

        const heroNameRef = doc(this.firestore, 'names/heroNames');
        updateDoc(heroNameRef, { ['names']: newHeroData.heroName });

        const userRef = doc(this.firestore, `users/${userId}`);
        batch.set(userRef, newUserData);

        const heroDataRef = doc(this.firestore, `heroData/${userId}`);
        batch.set(heroDataRef, newHeroData);

        const heroStatsRef = doc(this.firestore, `heroAttributes/${userId}`);
        batch.set(heroStatsRef, newHeroStats);

        const heroBuildingsRef = doc(this.firestore, `heroBuildings/${userId}`);
        batch.set(heroBuildingsRef, newHeroBuildings);

        const heroItemsRef = doc(this.firestore, `heroItems/${userId}`);
        batch.set(heroItemsRef, {});

        const heroResourcesRef = doc(this.firestore, `heroResources/${userId}`);
        batch.set(heroResourcesRef, newHeroResources);

        return from(batch.commit()).pipe(
          switchMap(() => {
            const filePath = `${userId}/${selectedFile.name}`;
            const fileRef = ref(this.storage, filePath);
            return from(uploadBytes(fileRef, selectedFile)).pipe(
              switchMap(() => getDownloadURL(fileRef)),
              switchMap((url) =>
                setDoc(userRef, { photoURL: url }, { merge: true })
              ),
              map(() => void 0)
            );
          })
        );
      })
    );
  }
}

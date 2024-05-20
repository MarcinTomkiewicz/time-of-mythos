import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IOriginsDefinition } from '../interfaces/definitions/i-origins';
import { IMetadata } from '../interfaces/metadata/i-metadata';
import {
  Firestore,
  getDoc,
  getDocs,
  doc,
  collection,
} from '@angular/fire/firestore';
import { getDownloadURL, getStorage, ref } from '@angular/fire/storage';
import { DataProcessingService } from './data-processing-service';
import { IHeroData } from '../interfaces/hero/i-hero-data';
import { IHeroStats } from '../interfaces/hero/i-hero-stats';
// import { QuerySnapshot, collection, doc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(
    private firestore: Firestore,
    private dataProcessingService: DataProcessingService
  ) {}
  
  getHeroData(userId: string): Observable<IHeroData> {
    return new Observable<IHeroData>((observer) => {
      const heroDataDocRef = doc(this.firestore, `heroData/${userId}`);

      getDoc(heroDataDocRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const heroData = snapshot.data() as IHeroData;
            observer.next(heroData);
          }
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  getAttributesData(userId: string): Observable<IHeroStats> {
    return new Observable<IHeroStats>((observer) => {
      const heroAttributesDocRef = doc(this.firestore, `heroAttributes/${userId}`);

      getDoc(heroAttributesDocRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const heroAttributes = snapshot.data() as IHeroStats;
            observer.next(heroAttributes);
          }
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  getDefinitions(
    collectionPath: string,
    idKey: string
  ): Observable<{ [key: string]: any }> {
    return new Observable<{ [key: string]: any }>((observer) => {
      const definitionsDocumentRef = doc(this.firestore, collectionPath);

      getDoc(definitionsDocumentRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const definitionsData = snapshot.data() as {
              [key: string]: any;
            };
            const processedData = this.dataProcessingService.processDefinitions(
              definitionsData,
              idKey
            );
            observer.next(processedData);
          }
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  getMetadata<T extends IMetadata>(
    metadataName: string
  ): Observable<{ [key: string]: T }> {
    return new Observable<{ [key: string]: T }>((observer) => {
      const metadataDocumentRef = doc(
        this.firestore,
        `metadata/${metadataName}`
      );

      getDoc(metadataDocumentRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const metadata = snapshot.data() as { [key: string]: T };
            observer.next(metadata);
            observer.complete();
          } else {
            observer.error('No such document!');
          }
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  getDownloadUrl(imagePath: string): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, imagePath);
    return getDownloadURL(storageRef);
  }
}
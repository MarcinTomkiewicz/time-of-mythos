import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { IMetadata } from '../interfaces/metadata/i-metadata';
import { Firestore, getDoc, doc, setDoc, addDoc, collection, updateDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { DataProcessingService } from './data-processing-service';
import {
  DocumentData,
  PartialWithFieldValue,
} from 'firebase/firestore';
import { IBuilding } from '../interfaces/definitions/i-building';
import { IArmor, IItem, IPrefix, ISuffix, IWeapon } from '../interfaces/definitions/i-item';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(
    private firestore: Firestore,
    private dataProcessingService: DataProcessingService
  ) {}

  getHeroData<T>(userId: string, collection: string): Observable<T> {
    return new Observable<T>((observer) => {
      const docRef = doc(this.firestore, `${collection}/${userId}`);

      getDoc(docRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as T;
            observer.next(data);           
            observer.complete();
          }
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  updateData<T extends PartialWithFieldValue<DocumentData>>(
    userId: string,
    collection: string,
    data: T
  ): Observable<void> {
    return new Observable<void>((observer) => {
      const docRef = doc(this.firestore, `${collection}/${userId}`);

      setDoc(docRef, data, { merge: true })
        .then(() => {
          observer.next();
          observer.complete();
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
            observer.complete();
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

  getDownloadUrl(imagePath: string): Observable<string> {
    const storage = getStorage();
    const storageRef = ref(storage, imagePath);
    return from(getDownloadURL(storageRef));
  }

  updateBuilding(
    buildingName: string,
    buildingData: IBuilding
  ): Observable<void> {
    const buildingRef = doc(this.firestore, 'definitions/buildings');
    const updateData = {
      [buildingName]: buildingData,
    };
    return from(setDoc(buildingRef, updateData, { merge: true }));
  }

  createItem(documentPath: string, item: IItem | IWeapon | IArmor | IPrefix | ISuffix): Observable<void> {
    return new Observable<void>((observer) => {
      const docRef = doc(this.firestore, documentPath);
      updateDoc(docRef, { [item.name.toLowerCase()]: item })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  updateItem(collectionPath: string, itemId: number, item: Partial<IItem | IWeapon | IArmor | IPrefix | ISuffix>): Observable<void> {
    return new Observable<void>((observer) => {
      const docRef = doc(this.firestore, `${collectionPath}/${itemId}`);
      updateDoc(docRef, item)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  uploadFile(file: File, itemType: string): Observable<string> {
    const storage = getStorage();
    const filePath = `items/${itemType}/${file.name}`;
    const fileRef = ref(storage, filePath);
    return new Observable<string>((observer) => {
      uploadBytes(fileRef, file)
        .then(() => getDownloadURL(fileRef))
        .then((url) => {
          observer.next(url);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
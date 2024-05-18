import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { IUser } from '../interfaces/general/i-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedInSubject.asObservable();
  private currentUser: User | null = null;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.auth.onAuthStateChanged((user: User | null) => {
      this.currentUser = user;
      this.loggedInSubject.next(!!user);
    });
  }

  waitForAuthState(): Observable<User | null> {
    return new Observable<User | null>((observer) => {
      this.auth.onAuthStateChanged((user: User | null) => {
        observer.next(user);
        observer.complete();
      });
    });
  }

  registerUser(email: string, password: string, name: string) {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(
        (userCredential: any) => {
          const user = userCredential.user;
          const userData: IUser = {
            isAdmin: false,
            isOnline: true,
            name: name,
            email: email,
          };
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return setDoc(userDocRef, userData).then(() => {
            return signInWithEmailAndPassword(this.auth, email, password);
          });
        }
      )
    );
  }

  loginUser(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logoutUser() {
    return from(signOut(this.auth));
  }

  getUser(): Observable<IUser | null> {
    return new Observable<IUser | null>((observer) => {
      this.waitForAuthState().subscribe(() => {
        if (this.currentUser) {
          const userDocRef = doc(this.firestore, `users/${this.currentUser.uid}`);
          getDoc(userDocRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data() as IUser;
              observer.next(userData);
            } else {
              observer.next(null);
            }
            observer.complete();
          }).catch((error) => {
            observer.error(error);
          });
        } else {
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }
}

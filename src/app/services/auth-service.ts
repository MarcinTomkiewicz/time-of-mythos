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
import { BehaviorSubject, catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { IUser } from '../interfaces/general/i-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedInSubject.asObservable();
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    this.auth.onAuthStateChanged((user: User | null) => {
      this.currentUserSubject.next(user);
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

  loginUser(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logoutUser() {
    return from(signOut(this.auth));
  }

  getUser(): Observable<IUser | null> {
    return this.currentUser$.pipe(
      switchMap((user: User | null) => {
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            map((docSnapshot) => {
              if (docSnapshot.exists()) {
                return docSnapshot.data() as IUser;
              } else {
                return null;
              }
            }),
            catchError((error) => {
              console.error('Error fetching user data:', error);
              return of(null);
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }

  getUserUID(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.uid : null;
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }
}

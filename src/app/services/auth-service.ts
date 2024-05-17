import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IUser } from '../interfaces/i-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedInSubject.asObservable();
  private currentUser: User | null = null;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.loggedInSubject.next(!!user);
    });
   }

  registerUser(email: string, password: string, name: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
      const user = userCredential.user;
      const userData: IUser = {
        isAdmin: false,
        isOnline: true,
        name: name,
        email: email
      };
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      return setDoc(userDocRef, userData).then(() => {
        return signInWithEmailAndPassword(this.auth, email, password);
      });
    }));
  }

  loginUser(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logoutUser() {
    return from(signOut(this.auth));
  }

  getUser(): Observable<IUser | null> {
    if (this.currentUser) {
      const userDocRef = doc(this.firestore, `users/${this.currentUser.uid}`);
      return from(getDoc(userDocRef)).pipe(
        switchMap(docSnapshot => {
          const userData = docSnapshot.data() as IUser;
          return [userData];
        })
      );
    } else {
      return of(null);
    }
}

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }
}
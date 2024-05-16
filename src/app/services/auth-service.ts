import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor() { }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  logIn(): void {
    this.loggedInSubject.next(true);
  }

  logOut(): void {
    this.loggedInSubject.next(false);
  }
}
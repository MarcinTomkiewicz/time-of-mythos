import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth-service';
import { IMenuItems } from '../interfaces/general/i-menu';
import { switchMap } from 'rxjs/operators'; // Importuje switchMap
import { Router } from '@angular/router';
import { IUser } from '../interfaces/general/i-user';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private authService: AuthService, private router: Router) {}


  
  getMenuItems(): Observable<IMenuItems[]> {
    return this.authService.loggedIn$.pipe(
      switchMap((loggedIn: boolean) => {
        if (loggedIn) {
          const gameRoutes: IMenuItems[] = [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'Settings', url: '/settings' },
            { label: 'Journey', url: '/journey' },
            { label: 'Armory', url: '/armory' },
            { label: 'Combat', url: '/combat' },
            { label: 'Trade', url: '/trade' },
            { label: 'Forum', url: '/forum' },
          ];
          return of(
            gameRoutes.map((gameRoute) => ({
              label: gameRoute.label,
              url: this.router.createUrlTree([gameRoute.url]).toString(),
            }))
          );
        } else {
          const homeRoutes: IMenuItems[] = [
            { label: 'Home', url: '/' },
            { label: 'About', url: '/about' },
            { label: 'Get started', url: '/start-journey' },
            { label: 'Story', url: '/story' },
            { label: 'Forum', url: '/forum' },
            { label: 'Credits', url: '/credits' },
            { label: 'Contact', url: '/contact' },
          ];
          return of(
            homeRoutes.map((homeRoute) => ({
              label: homeRoute.label,
              url: this.router.createUrlTree([homeRoute.url]).toString(),
            }))
          );
        }
      })
    );
  }
}

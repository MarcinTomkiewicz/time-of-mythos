import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth-service';
import { IMenuItems } from '../interfaces/general/i-menu';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

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
            { label: 'Attributes', url: '/attributes' },
            { label: 'Challenges', url: '/challenges' },
            { label: 'Combat', url: '/combat' },
            { label: 'Armory', url: '/armory' },
            { label: 'Mansion', url: '/mansion'},
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
  
  getAdminMenuItems(): Observable<IMenuItems[]> {
    return this.authService.getUser().pipe(
      map(user => {
        if (user && user.isAdmin) {
          const adminRoutes: IMenuItems[] = [
            { label: 'Manage Buildings', url: '/admin/manage-buildings' },
            { label: 'Manage Items', url: '/admin/manage-items' },
          ];
          return adminRoutes.map((adminRoute) => ({
            label: adminRoute.label,
            url: this.router.createUrlTree([adminRoute.url]).toString(),
          }));
        } else {
          return [];
        }
      })
    );
  }
}


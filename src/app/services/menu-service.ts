import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth-service';
import { IMenuItems } from '../interfaces/i-menu';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private authService: AuthService) {}

  getMenuItems(): Observable<IMenuItems[]> {
    if (this.authService.isLoggedIn()) {
      return of([
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'Settings', url: '/settings' },
        { label: 'Journey', url: '/journey'},
        { label: 'Armory', url: '/armory'},
        { label: 'Combat', url: '/combat'},
        { label: 'Trade', url: '/trade'},
        { label: 'Forum', url: '/forum'},
      ]);
    } else {
      return of([
        { label: 'Home', url: '/' },
        { label: 'About', url: '/about' },
        { label: 'Get started', url: '/start' },
        { label: 'Story', url: '/story' },
        { label: 'Forum', url: '/forum' },
        { label: 'Credits', url: '/credits' },
        { label: 'Contact', url: '/contact' },
      ]);
    }
  }
}

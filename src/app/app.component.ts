import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserPanelComponent } from './components/user-panel/user-panel.component';
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import { AuthFormsComponent } from './common/auth-forms/auth-forms.component';
import { AuthService } from './services/auth-service';
import { MainContentComponent } from './components/main-content/main-content.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { IUser } from './interfaces/i-user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    UserPanelComponent,
    TopMenuComponent,
    AuthFormsComponent,
    MainContentComponent,
    SideMenuComponent,
  ],
  providers: [
    AuthService
  ]
})
export class AppComponent {
  title = 'Time of Mythos - Embark on an Epic Journey Through Ancient Greece!';
  isLoggedIn: boolean = false;
  user!: IUser;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.loggedIn$.subscribe((isLoggedIn: boolean) =>{
      this.isLoggedIn = isLoggedIn;
    })
  }
}

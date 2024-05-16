import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserPanelComponent } from './components/user-panel/user-panel.component';
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import { AuthFormsComponent } from './common/auth-forms/auth-forms.component';
import { AuthService } from './services/auth-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UserPanelComponent, TopMenuComponent, AuthFormsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Time of Mythos';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) 
  {}

  ngOnInit(): void {
    this.authService.loggedIn$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn; // Aktualizacja zmiennej isLoggedIn w komponencie
    });
  }
}

import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { AuthFormsComponent } from '../../common/auth-forms/auth-forms.component';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [NgIf, AuthFormsComponent],
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css'],
})
export class UserPanelComponent implements OnInit{
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) 
  {}

  ngOnInit(): void {
    this.authService.loggedIn$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn; // Aktualizacja zmiennej isLoggedIn w komponencie
    });
  }

  logout() {
    this.authService.logOut();
  }
}

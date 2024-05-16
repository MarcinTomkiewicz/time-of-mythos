import { NgIf } from '@angular/common';
import { Component, Input, OnInit, } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-auth-forms',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './auth-forms.component.html',
  styleUrl: './auth-forms.component.css'
})
export class AuthFormsComponent implements OnInit {
  @Input() isInTopBar: boolean = false;

  isLoggedIn: boolean = false;
  loginFormMode: 'login' | 'register' = 'login';
  registerForm: FormGroup;
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.registerForm = this.formBuilder.group({
      characterName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.authService.loggedIn$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn; // Aktualizacja zmiennej isLoggedIn w komponencie
    });
  }

  register() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
      this.registerForm.reset() // Tutaj możesz wykonać logikę rejestracji, np. wysłanie danych na serwer
    }
  }
  
  login() {
    if (this.loginForm.valid) {
      this.authService.logIn()
      this.loginForm.reset() // Tutaj możesz wykonać logikę logowania, np. wysłanie danych na serwer
    }
  }

  logout() {
    this.authService.logOut();
  }

  toggleLoginFormMode(mode: 'login' | 'register') {
    this.loginFormMode = mode;
  }
}

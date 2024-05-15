import { NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css'],
})
export class UserPanelComponent implements OnInit {
  isLoggedIn: boolean = false;
  loginFormMode: 'login' | 'register' = 'login';
  registerForm: FormGroup;
  loginForm: FormGroup;
  // isLoggingIn: boolean = false;

  constructor(private formBuilder: FormBuilder) {
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
    // Tutaj możesz dodać logikę sprawdzającą, czy użytkownik jest zalogowany
    // Na potrzeby przykładu ustawiamy isLoggedIn na false
    this.isLoggedIn = false;
  }

  register() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value); // Tutaj możesz wykonać logikę rejestracji, np. wysłanie danych na serwer
    }
  }
  
  login() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value); // Tutaj możesz wykonać logikę logowania, np. wysłanie danych na serwer
    }
  }

  toggleLoginFormMode(mode: 'login' | 'register') {
    this.loginFormMode = mode;
  }
}

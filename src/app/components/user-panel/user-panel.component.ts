import { NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth-service';

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
    this.isLoggedIn = this.authService.isLoggedIn();
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

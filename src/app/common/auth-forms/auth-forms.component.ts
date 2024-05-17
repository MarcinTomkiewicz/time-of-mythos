import { NgIf } from '@angular/common';
import { Component, Input, OnInit, } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-auth-forms',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, ngbTooltipModule],
  templateUrl: './auth-forms.component.html',
  styleUrl: './auth-forms.component.css'
})
export class AuthFormsComponent implements OnInit {
  @Input() isInTopBar: boolean = false;

  isLoggedIn: boolean = false;
  loginFormMode: 'login' | 'register' = 'register';
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
    this.authService.loggedIn$.subscribe((isLoggedIn: boolean) =>{
      this.isLoggedIn = isLoggedIn;
    })
  }

  register() {
    if (this.registerForm.valid) {
      this.authService.registerUser(this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.characterName)
      this.registerForm.reset() // Tutaj możesz wykonać logikę rejestracji, np. wysłanie danych na serwer
    }
  }
  
  login() {
    if (this.loginForm.valid) {
      this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      this.loginForm.reset() // Tutaj możesz wykonać logikę logowania, np. wysłanie danych na serwer
    }
  }

  logout() {
    this.authService.logoutUser();
  }

  toggleLoginFormMode(mode: 'login' | 'register') {
    this.loginFormMode = mode;
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control && control.invalid && control.touched) {
      if (control.hasError('required')) {
        return 'This field is required';
      } else if (control.hasError('email')) {
        return 'Invalid email format';
      } else if (control.hasError('minLength')) {
        return 'Password must be at least 6 characters long';
      }
    }
    return '';
  }
}

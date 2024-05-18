import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsService } from '../../services/forms-service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.css',
})
export class CreateCharacterComponent {
  formData: any;
  characterForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public formsService: FormsService
  ) {
    this.characterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      characterName: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit(): void {
    this.formData = this.formsService.getFormData();
    if (this.formData) {
      this.characterForm.patchValue(this.formData);
    }
  }

  register(): void {
    if (this.characterForm.valid) {
      // Logika po zatwierdzeniu formularza
      console.log('Formularz zatwierdzony:', this.characterForm.value);
    }
  }
}

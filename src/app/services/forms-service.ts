import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  private formData: any = {};

  setFormData(data: any): void {
    this.formData = data;
  }

  getFormData(): any {
    return this.formData;
  }

  getErrorMessage(
    control: AbstractControl | null,
    controlName: string
  ): string {
    if (control && control.invalid && control.touched) {
      if (control.hasError('required')) {
        return 'This field is required';
      } else if (control.hasError('email')) {
        return 'Invalid email format';
      } else if (control.hasError('minlength')) {
        if (controlName === 'password') {
          return 'Password must be at least 6 characters long';
        } else if (controlName === 'characterName') {
          return 'Character name must be at least 4 characters long';
        }
      }
    }
    return '';
  }
}

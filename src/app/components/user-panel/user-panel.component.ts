import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { AuthFormsComponent } from '../../common/auth-forms/auth-forms.component';
import { IUser } from '../../interfaces/general/i-user';
import { CommonService } from '../../services/common-service';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [NgIf, AuthFormsComponent],
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css'],
})
export class UserPanelComponent implements OnInit {
  userUid!: string | null;
  user!: IUser | null;

  constructor(private authService: AuthService, private commonService: CommonService) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.userUid = this.authService.getUserUID();

      this.user = user;
    })
  }

  getFormattedLastLogin(): string {
    if (this.user) {
      return this.commonService.convertTimestampToDate(this.user.lastLogin);
    }
    return 'N/A';
  }

  logout() {
    this.authService.logoutUser();
  }
}

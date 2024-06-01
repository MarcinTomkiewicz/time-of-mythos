import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IMenuItems } from '../../interfaces/general/i-menu';
import { MenuService } from '../../services/menu-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})
export class TopMenuComponent implements OnInit {
  
  @Input() isAdminMenu: boolean = false;

  menuItems?: IMenuItems[];

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    if (this.isAdminMenu) {
      this.menuService.getAdminMenuItems().subscribe(adminMenuItems => {
        this.menuItems = adminMenuItems;
      });
    } else {
      this.menuService.getMenuItems().subscribe(menuItems => {
        this.menuItems = menuItems;
      });
    }
  }
}
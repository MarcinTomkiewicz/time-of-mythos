import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IMenuItems } from '../../interfaces/general/i-menu';
import { MenuService } from '../../services/menu-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent implements OnInit {
  loading: boolean = true;

  menuItems?: IMenuItems[];

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe(menuItems => {
      this.menuItems = menuItems;
      this.loading = false;
    });
  }
}

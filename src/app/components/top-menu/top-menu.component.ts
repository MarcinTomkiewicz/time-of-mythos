import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IMenuItems } from '../../interfaces/i-menu';
import { MenuService } from '../../services/menu-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css'
})
export class TopMenuComponent implements OnInit {

  menuItems?: IMenuItems[];

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe(menuItems => {
      this.menuItems = menuItems;
    });
  }
}

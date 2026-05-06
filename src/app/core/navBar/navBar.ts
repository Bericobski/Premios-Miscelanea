import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatIconRegistry } from "@angular/material/icon";
import { MatIconModule } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-navBar',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './navBar.html',
  styleUrl: './navBar.scss',
})
export class NavBar {


  
  is_logged: boolean = false;
  is_admin: boolean = false;

  constructor(private authService: Auth) {
  }

  get_is_admin(): boolean {
    return this.authService.get_is_admin();
  }
  
  



}

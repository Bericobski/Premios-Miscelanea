import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatIconRegistry } from "@angular/material/icon";
import { MatIconModule } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';



@Component({
  selector: 'app-navBar',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './navBar.html',
  styleUrl: './navBar.scss',
})
export class NavBar {


  isAdmin$: Observable<boolean>;
  isLogged$: Observable<boolean>;
  showUserMenu = false;

  constructor(private authService: Auth, private router: Router) {
    this.isAdmin$ = this.authService.isAdmin$;
    this.isLogged$ = this.authService.isLogged$;
  }

  toggleUserMenu() {
        this.showUserMenu = !this.showUserMenu;
    }

  logout() {
      this.authService.logout();
      this.showUserMenu = false;
      this.router.navigate(['/login']);
  }
  
  
  



}

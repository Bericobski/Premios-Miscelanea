import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavBar } from '../../core/navBar/navBar';
import { Footer } from '../../core/footer/footer';  
import { User, UserRole } from '../../classes/user';

@Component({
  selector: 'app-user-profile',
  imports: [NavBar, Footer, RouterLink, RouterOutlet],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {

  user : User = new User(
    1,
    'Bruno',
    'Bevilaqua',
    'bruno.bevilaqua',
    'bruno.bevilaqua@example.com',
    'password123',
    'profile.jpg',
    'I am a passionate gamer and reviewer.',
    75,
    ['Action', 'Adventure', 'RPG'],
    UserRole.USER
  );
  

}

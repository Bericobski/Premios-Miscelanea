import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavBar } from '../../../core/navBar/navBar';
import { Footer } from '../../../core/footer/footer';
import { User, UserRole } from '../../../classes/user';
import { CommonModule } from '@angular/common';
import { FilterUsersPipe } from '../../../pipes/filter-users-pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, RouterLink, NavBar, Footer, CommonModule, FilterUsersPipe, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  public users: Array<User> = [];
  public searchQuery = '';

  constructor() {
    this.initializeUsers();
  }

  initializeUsers() {
    this.users = [
      new User(1, 'Bruno', 'Bevilaqua', 'bruno.bevilaqua', 'bruno.bevilaqua@example.com', 'password123', 'https://via.placeholder.com/100?text=BB', 'Passionate gamer and reviewer', UserRole.USER),
      new User(2, 'Maria', 'Garcia', 'maria.garcia', 'maria.garcia@example.com', 'password123', 'https://via.placeholder.com/100?text=MG', 'Video game enthusiast', UserRole.USER),
      new User(3, 'John', 'Smith', 'john.smith', 'john.smith@example.com', 'password123', 'https://via.placeholder.com/100?text=JS', 'Casual gamer', UserRole.USER),
      new User(4, 'Sofia', 'Rodriguez', 'sofia.rodriguez', 'sofia.rodriguez@example.com', 'password123', 'https://via.placeholder.com/100?text=SR', 'RPG fan', UserRole.USER),
      new User(5, 'Alex', 'Chen', 'alex.chen', 'alex.chen@example.com', 'password123', 'https://via.placeholder.com/100?text=AC', 'Competitive gamer', UserRole.USER),
      new User(6, 'Emma', 'Wilson', 'emma.wilson', 'emma.wilson@example.com', 'password123', 'https://via.placeholder.com/100?text=EW', 'Indie game lover', UserRole.USER),
      new User(7, 'Carlos', 'Lopez', 'carlos.lopez', 'carlos.lopez@example.com', 'password123', 'https://via.placeholder.com/100?text=CL', 'Strategy game player', UserRole.USER),
      new User(8, 'Nina', 'Patel', 'nina.patel', 'nina.patel@example.com', 'password123', 'https://via.placeholder.com/100?text=NP', 'Adventure game fan', UserRole.USER),
    ];
  }

  deleteUser(userId: number) {
    // To be implemented
    console.log('Delete user:', userId);
  }

  suspendUser(userId: number) {
    // To be implemented
    console.log('Suspend user:', userId);
  }
}


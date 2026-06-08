import { Routes } from '@angular/router';
import { AddGameForm } from './components/add-game-form/add-game-form';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { GamePageComponent } from './components/game/gamePage';
import { Home } from './components/home/home';
import { UserProfile } from './components/user-profile/user-profile';
import { ErrorPageNotFound } from './components/error-page-not-found/error-page-not-found';
import { AboutPage } from './components/about-page/about-page';
import { ContactUsPage } from './components/contact-us-page/contact-us-page';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';

export const routes: Routes = [
    { path: 'add-game-form', component: AddGameForm },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'game-page', component: GamePageComponent },
    { path: 'home', component: Home },
    { path: 'user-profile', component: UserProfile },
    { path: 'about', component: AboutPage },
    { path: 'contact-us', component: ContactUsPage },
    { path: 'admin-dashboard', component: AdminDashboard },
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    { path: '**', component: ErrorPageNotFound }

];

import { Routes } from '@angular/router';
import { AddGameForm } from './components/add-game-form/add-game-form';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { GamePageComponent } from './components/game/gamePage';
import { Home } from './components/home/home';
import { UserProfile } from './components/user-profile/user-profile';
import { ErrorPageNotFound } from './components/error-page-not-found/error-page-not-found';

export const routes: Routes = [
    { path: 'add-game-form', component: AddGameForm },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'game-page', component: GamePageComponent },
    { path: 'home', component: Home },
    { path: 'user-profile', component: UserProfile },
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    { path: '**', component: ErrorPageNotFound }

];

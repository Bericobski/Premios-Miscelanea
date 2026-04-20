import { Routes } from '@angular/router';
import { AddGameForm } from './components/add-game-form/add-game-form';
import { Login } from './components/login/login';
import { Register } from './components/register/register';

export const routes: Routes = [
    { path: 'add-game-form', component: AddGameForm },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: '', redirectTo: 'login', pathMatch: 'full' }

];

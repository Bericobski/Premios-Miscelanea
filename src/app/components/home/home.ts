import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavBar } from '../../core/navBar/navBar';
import { Footer } from '../../core/footer/footer';


@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, NavBar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}

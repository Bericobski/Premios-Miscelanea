import { Component } from '@angular/core';
import { NavBar } from "../../core/navBar/navBar";
import { Footer } from "../../core/footer/footer";

@Component({
  selector: 'app-about-page',
  imports: [NavBar, Footer],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {}

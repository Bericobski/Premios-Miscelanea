import { Component } from '@angular/core';
import { NavBar } from "../../core/navBar/navBar";
import { Footer } from "../../core/footer/footer";

@Component({
  selector: 'app-contact-us-page',
  imports: [NavBar, Footer],
  templateUrl: './contact-us-page.html',
  styleUrl: './contact-us-page.scss',
})
export class ContactUsPage {}

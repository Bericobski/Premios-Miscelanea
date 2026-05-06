import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page-not-found',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './error-page-not-found.html',
  styleUrl: './error-page-not-found.scss',
})
export class ErrorPageNotFound {}

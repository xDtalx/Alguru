import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Alguru';
  showSmallHeader: boolean;

  constructor(private authService: AuthService) {
    document.documentElement.style.setProperty('--main-display', 'block');
    document.documentElement.style.setProperty('--main-width', '80vw');
  }

  ngOnInit(): void {
    this.authService.autoAuthUser();
  }
}

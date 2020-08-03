import { Component, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public title = 'Alguru';
  public showSmallHeader: boolean;
  public showOverlay = true;

  constructor(private authService: AuthService, private router: Router) {
    document.documentElement.style.setProperty('--main-display', 'block');
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });
  }

  public ngOnInit(): void {
    this.authService.autoAuthUser();
  }

  // Shows and hides the loading spinner during RouterEvent changes
  private navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.showOverlay = true;
    }

    if (event instanceof NavigationEnd) {
      setTimeout(() => (this.showOverlay = false), 300);
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      setTimeout(() => (this.showOverlay = false), 300);
    }

    if (event instanceof NavigationEnd) {
      setTimeout(() => (this.showOverlay = false), 300);
    }
  }
}

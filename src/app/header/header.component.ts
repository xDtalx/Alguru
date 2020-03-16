import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.css' ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  private authListenerSubs: Subscription;
  public isUserAuth: boolean;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isUserAuth = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
    .getAuthStatusListener()
    .subscribe(isAuth => {
      this.isUserAuth = isAuth;
    });
}

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}

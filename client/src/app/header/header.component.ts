import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { SettingsService } from '../settings.service';

enum ModalTypes {
  LoginModal = 'loginModal',
  RegisterModal = 'registerModal'
}

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.less'],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('toggleNavCheckbox', { read: ElementRef })
  public toggleNavCheckbox: ElementRef;

  private authListenerSubs: Subscription;
  private adminListenerSubs: Subscription;
  private smallHeaderSubs: Subscription;
  private smallHeaderOnLogoutSubs: Subscription;
  private navigateUrlOnLogoutSubs: Subscription;
  private showSmallHeaderAfterHamburgerClicked = true;
  private username: string;
  private navigateUrlOnLogout: string;
  private showSmallHeaderOnLogout: boolean;
  public showLogin: boolean;
  public showRegister: boolean;
  public showModal: boolean;
  public ModalTypes = ModalTypes;
  public isUserAuth: boolean;
  public isRelease: boolean;
  public showSmallHeader: boolean;
  public isAdmin: boolean;
  public profileURL = '/users/profile/';
  public isOpenMenu = false;
  public openNav: boolean;
  public showNotifications = false;
  public newNotificationsCount = '';
  public notificationsSeen = 'false';

  constructor(private authService: AuthService, private settingsService: SettingsService, private route: Router) {
    this.smallHeaderSubs = this.settingsService
      .getSmallHeaderObservable()
      .subscribe((isShow) => this.setSmallHeader(isShow));
    this.navigateUrlOnLogoutSubs = this.settingsService
      .getNavigateUrlOnLogoutObservable()
      .subscribe((url) => (this.navigateUrlOnLogout = url));
    this.smallHeaderOnLogoutSubs = this.settingsService
      .getSmallHeaderOnLogoutObservable()
      .subscribe((isShow) => (this.showSmallHeaderOnLogout = isShow));
  }

  public ngOnInit() {
    window.addEventListener('click', this.closeNotificationsCenter.bind(this));
    this.isRelease = environment.isRelease;
    this.isUserAuth = this.authService.getIsAuth();
    this.isAdmin = this.authService.getIsAdmin();

    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe((isAuth) => {
      this.isUserAuth = isAuth;

      if (isAuth) {
        this.hide();
      }
    });

    this.adminListenerSubs = this.authService.getAdminListener().subscribe((isAdmin) => {
      this.isAdmin = isAdmin;

      if (!this.username) {
        this.username = this.authService.getUsername();
        this.profileURL += this.username;
      }
    });

    this.username = this.authService.getUsername();

    if (this.username) {
      this.profileURL += this.username;
    }
  }

  public ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.adminListenerSubs.unsubscribe();
    this.smallHeaderSubs.unsubscribe();
    this.smallHeaderOnLogoutSubs.unsubscribe();
    this.navigateUrlOnLogoutSubs.unsubscribe();
  }

  public setSmallHeader(isShow: boolean) {
    const length = 300;
    this.showSmallHeader = isShow;
    this.closeAll();

    if (this.showSmallHeader) {
      const header = $('div.header');
      const container = $('#container');
      const target = { height: container.height() };
      const onHeaderDone = () => header.css('height', 'auto');

      header.addClass('show-header-color');
      header.removeClass('hide-header-color');
      header.animate(target, length, onHeaderDone);

      this.closeHamburger();
    } else {
      const header = $('div.header');

      header.addClass('hide-header-color');
      header.removeClass('show-header-color');
      header.animate({ height: '100vh' }, length);
    }
  }

  public closeHamburger(setSmallHeader = true) {
    this.showSmallHeaderAfterHamburgerClicked = setSmallHeader;

    if (this.toggleNavCheckbox.nativeElement.checked === true) {
      this.toggleNavCheckbox.nativeElement.click();
    }
  }

  public onLogout() {
    this.username = null;
    this.isAdmin = false;
    this.profileURL = '/users/profile/';

    this.setSmallHeader(this.showSmallHeaderOnLogout);
    this.authService.logout(this.navigateUrlOnLogout);
  }

  public closeNotificationsCenter(event) {
    let target = event.target as HTMLElement;

    while (
      target &&
      !target.classList.contains('notification-container') &&
      !target.classList.contains('notification-btn')
    ) {
      target = target.parentElement;
    }

    if (
      !target ||
      (!target.classList.contains('notification-btn') && !target.classList.contains('notification-container'))
    ) {
      this.closeAll();
    }
  }

  public show(type: ModalTypes) {
    this.showModal = true;

    if (type === ModalTypes.LoginModal) {
      this.showLogin = true;
      this.showRegister = false;
    } else {
      this.showLogin = false;
      this.showRegister = true;
    }
  }

  public hide() {
    this.showModal = false;
    this.showLogin = false;
    this.showRegister = false;
  }

  public toggleShowNotifications() {
    this.showNotifications = !this.showNotifications;
    this.notificationsSeen = this.notificationsSeen === 'false' ? 'true' : 'false';
  }

  public closeAll() {
    this.showNotifications = false;
  }

  public setNewNotificationsCount(count: number): void {
    const newCount = count === 0 ? '' : String(count);

    if (newCount !== this.newNotificationsCount) {
      this.newNotificationsCount = newCount;
    }
  }

  public toggleNav() {
    this.openNav = !this.openNav;
    const length = 300;
    const header = $('div.header');

    if (this.openNav) {
      document.documentElement.style.setProperty('--app-overflow', 'hidden');
    } else {
      document.documentElement.style.setProperty('--app-overflow', 'auto');
    }

    if (this.openNav) {
      header.animate({ height: '100vh' }, length);
    } else if (this.route.url !== '/') {
      this.setSmallHeader(this.showSmallHeaderAfterHamburgerClicked);
    }
  }
}

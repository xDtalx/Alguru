import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { INotification } from '../notification-center/notification.model';
import { NotificationService } from '../notification-center/notification.service';
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
  // Hamburger menu
  @ViewChild('toggleNavCheckbox', { read: ElementRef })
  public toggleNavCheckbox: ElementRef;

  public isOpenMenu = false;
  public openNav: boolean;

  // auth
  private authListenerSubs: Subscription;
  private adminListenerSubs: Subscription;
  private username: string;
  public showLogin: boolean;
  public showRegister: boolean;
  public showModal: boolean;
  public ModalTypes = ModalTypes;
  public isAdmin: boolean;
  public isUserAuth: boolean;
  public isRelease: boolean;

  // Navigation
  private navigateUrlOnLogoutSubs: Subscription;
  private navigateUrlOnLogout: string;
  public profileURL = '/users/profile/';

  // Small header handlers
  private showSmallHeaderAfterHamburgerClicked = true;
  private showSmallHeaderOnLogout: boolean;
  private smallHeaderSubs: Subscription;
  private smallHeaderOnLogoutSubs: Subscription;
  public showSmallHeader: boolean;

  // Notifications
  private newNotificationsSubs: Subscription;
  private checkNotificationsIntervalHandle: any;
  private numOfSecondsToCheckNotifications = 10;
  public showNotifications = false;
  public newNotificationsCount = '';
  public notificationsSeen = false;
  public notifications: INotification[];

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    private route: Router,
    private notificationService: NotificationService
  ) {
    this.smallHeaderSubs = this.settingsService
      .getSmallHeaderObservable()
      .subscribe((isShow) => this.setSmallHeader(isShow));
    this.navigateUrlOnLogoutSubs = this.settingsService
      .getNavigateUrlOnLogoutObservable()
      .subscribe((url) => (this.navigateUrlOnLogout = url));
    this.smallHeaderOnLogoutSubs = this.settingsService
      .getSmallHeaderOnLogoutObservable()
      .subscribe((isShow) => (this.showSmallHeaderOnLogout = isShow));
    this.newNotificationsSubs = this.notificationService
      .getNotificationsUpdatedListener()
      .subscribe(this.onNotificationsUpdated.bind(this));
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(this.onAuthStatusChanged.bind(this));
    this.adminListenerSubs = this.authService.getAdminListener().subscribe((isAdmin) => (this.isAdmin = isAdmin));
    window.addEventListener('click', this.closeNotificationsCenter.bind(this));
  }

  public ngOnInit() {
    this.isRelease = environment.isRelease;
    this.isUserAuth = this.authService.getIsAuth();
    this.isAdmin = this.authService.getIsAdmin();
    this.username = this.authService.getUsername();

    if (this.profileURL === '/users/profile/') {
      this.profileURL += this.username;
    }

    if (this.isUserAuth) {
      this.checkNotificationsIntervalHandle = setInterval(
        () => this.notificationService.updateNotifications(),
        this.numOfSecondsToCheckNotifications * 1000
      );
      this.notificationService.updateNotifications();
    }
  }

  public ngOnDestroy() {
    this.newNotificationsSubs.unsubscribe();
    this.authListenerSubs.unsubscribe();
    this.adminListenerSubs.unsubscribe();
    this.smallHeaderSubs.unsubscribe();
    this.smallHeaderOnLogoutSubs.unsubscribe();
    this.navigateUrlOnLogoutSubs.unsubscribe();
    clearInterval(this.checkNotificationsIntervalHandle);
  }

  public setSmallHeader(isShow: boolean) {
    const length = 300;
    this.showSmallHeader = isShow;
    this.setNotificationsDisplay(false);

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
    clearInterval(this.checkNotificationsIntervalHandle);
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
      this.setNotificationsDisplay(false);
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
    this.setNotificationsDisplay(!this.showNotifications, true);
  }

  public setNotificationsDisplay(show: boolean, notificationsSeen?: boolean) {
    if (this.notificationsSeen) {
      this.notificationService.setNotificationsSeen();
      this.newNotificationsCount = '';
    }

    if (notificationsSeen) {
      this.notificationsSeen = !this.notificationsSeen;
    }

    this.showNotifications = show;
  }

  public setNewNotificationsCount(count: number): void {
    const newCount = count === 0 ? '' : String(count);

    if (newCount !== this.newNotificationsCount) {
      this.notificationsSeen = false;
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

  private onNotificationsUpdated(notifications: INotification[]) {
    this.notifications = notifications;
    let count = 0;

    this.notifications.forEach((notification) => {
      if (!notification.seen) {
        count++;
      }
    });

    this.setNewNotificationsCount(count);
  }

  private onAuthStatusChanged(isAuth: boolean) {
    this.isUserAuth = isAuth;

    if (isAuth) {
      this.hide();
    }

    if (!this.username) {
      this.username = this.authService.getUsername();
    }

    if (this.profileURL === '/users/profile/') {
      this.profileURL += this.username;
    }

    if (isAuth && !this.checkNotificationsIntervalHandle) {
      this.checkNotificationsIntervalHandle = setInterval(
        () => this.notificationService.updateNotifications(),
        this.numOfSecondsToCheckNotifications * 1000
      );
      this.notificationService.updateNotifications();
    }
  }
}

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { SettingsService } from '../settings.service';
import * as $ from 'jquery';
import { Router } from '@angular/router';

enum ModalTypes {
  LoginModal = 'loginModal',
  RegisterModal = 'registerModal'
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('toggleNavCheckbox', { read: ElementRef }) toggleNavCheckbox: ElementRef;

  private authListenerSubs: Subscription;
  private adminListenerSubs: Subscription;
  private showSmallHeaderAfterHamburgerClicked = true;
  public showLoginModal: boolean;
  public showRegister: boolean;
  public showModal: boolean;
  public ModalTypes = ModalTypes;
  public isUserAuth: boolean;
  public isRelease: boolean;
  public showSmallHeader: boolean;
  public isAdmin: boolean;
  public profileURL = '/profile/';
  public isOpenMenu = false;
  public openNav: boolean;

  constructor(private authService: AuthService, private settingsService: SettingsService, private route: Router) {
    this.settingsService.getSmallHeaderObservable().subscribe((isShow) => this.setSmallHeader(isShow));
  }

  ngOnInit() {
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
      this.profileURL += this.authService.getUsername();
    });

    if (this.authService.getUsername()) {
      this.profileURL += this.authService.getUsername();
    }
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.adminListenerSubs.unsubscribe();
  }

  setSmallHeader(isShow: boolean) {
    const length = 300;
    this.showSmallHeader = isShow;

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

  closeHamburger(setSmallHeader = true) {
    this.showSmallHeaderAfterHamburgerClicked = setSmallHeader;

    if (this.toggleNavCheckbox.nativeElement.checked === true) {
      this.toggleNavCheckbox.nativeElement.click();
    }
  }

  onLogout() {
    this.setSmallHeader(false);
    this.authService.logout();
  }

  show(type: ModalTypes) {
    this.showModal = true;

    if (type === ModalTypes.LoginModal) {
      this.showLoginModal = true;
    } else {
      this.showRegister = true;
    }
  }

  hide() {
    this.showModal = false;
    this.showLoginModal = false;
    this.showRegister = false;
  }

  openRegister() {
    this.showLoginModal = false;
    this.showRegister = true;
  }

  toggleNav() {
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

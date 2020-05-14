import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { SettingsService } from '../settings.service';
import * as $ from 'jquery';

enum ModalTypes {
  LoginModal = 'loginModal',
  RegisterModal ='registerModal'
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.less' ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  private authListenerSubs: Subscription;
  private adminListenerSubs: Subscription;
  showLoginModal: boolean;
  showRegister: boolean;
  showModal : boolean;
  ModalTypes = ModalTypes;
  isUserAuth: boolean;
  isRelease: boolean;
  showSmallHeader: boolean;
  isAdmin: boolean;

  constructor(private authService: AuthService, private settingsService: SettingsService) {
    this.settingsService.getSmallHeaderObservable().subscribe(isShow => this.setSmallHeader(isShow));
  }

  ngOnInit() {
    this.isRelease = environment.isRelease;
    this.isUserAuth = this.authService.getIsAuth();
    this.isAdmin = this.authService.getIsAdmin();
    this.authListenerSubs = this.authService.getAuthStatusListener()
    .subscribe(isAuth => {
      this.isUserAuth = isAuth;

      if(isAuth) {
        this.hide();
      }
    });
    this.adminListenerSubs = this.authService.getAdminListener()
    .subscribe(isAdmin => { this.isAdmin = isAdmin; console.log(this.isAdmin)});
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.adminListenerSubs.unsubscribe();
  }

  setSmallHeader(isShow: boolean) {
    var length = 200;
    this.showSmallHeader = isShow;

    if(this.showSmallHeader) {
      var header = $('div.header');
      var background = $('div.background');
      var container = $('#container');
      var target = {height: container.height()};
      var onDone = () => header.css('height', 'auto');

      header.addClass('show-header-color');
      header.removeClass('hide-header-color');
      background.animate(target, length);
      header.animate(target, length, onDone);
    } else {
      var header = $('div.header');
      var background = $('div.background');
      
      header.addClass('hide-header-color');
      header.removeClass('show-header-color');
      background.animate({height: '100vh'}, length);
      header.animate({height: '100vh'}, length);
    }
  }

  onLogout() {
    this.setSmallHeader(false);
    this.authService.logout();
  }

  show(type : ModalTypes) {
    this.showModal = true;

    if (type == ModalTypes.LoginModal) {
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

  openRegister(){
    this.showLoginModal = false;
    this.showRegister = true;
  }
}

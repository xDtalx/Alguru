import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { SettingsService } from '../settings.service';

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
    this.settingsService.getSmallHeaderObservable().subscribe(isShow => this.showSmallHeader = isShow)
  }

  ngOnInit() {
    this.isRelease = environment.isRelease;
    this.isUserAuth = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener()
    .subscribe(isAuth => {
      this.isUserAuth = isAuth;

      if(isAuth) {
        this.hide();
      }
    });
    this.adminListenerSubs = this.authService.getAdminListener()
    .subscribe(isAdmin => this.isAdmin = isAdmin);
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.adminListenerSubs.unsubscribe();
  }

  onLogout() {
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

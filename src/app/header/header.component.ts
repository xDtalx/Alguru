import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

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
  showLoginModal: boolean;
  showRegister: boolean;
  showModal : boolean;
  ModalTypes = ModalTypes;

  private authListenerSubs: Subscription;
  public isUserAuth: boolean;
  public isRelease: boolean;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isRelease = environment.isRelease;
    this.isUserAuth = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
    .getAuthStatusListener()
    .subscribe(isAuth => {
      this.isUserAuth = isAuth;

      if(isAuth) {
        this.hide();
      }
    });
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }

  show(type : ModalTypes) {
    this.showModal = true;

    if (type==ModalTypes.LoginModal) {
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

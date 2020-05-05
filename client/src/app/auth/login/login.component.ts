import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.less' ]
})
export class LoginComponent implements OnInit, OnDestroy {

  public isLoading = false;
  authStatusSub: Subscription;
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter();
  @Output() onRegisterOpen: EventEmitter<any> = new EventEmitter();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = authStatus;
      });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  onLogin(loginForm: NgForm) {
    if(loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(loginForm.value.username, loginForm.value.password);
  }

  hide(){
    this.onCloseModal.emit();
  }

  openRegister(){
    this.onRegisterOpen.emit();
  }
}

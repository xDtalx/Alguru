import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  styleUrls: ['./login.component.less'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  @Output()
  public modalClosed: EventEmitter<any> = new EventEmitter();

  @Output()
  public regiterOpened: EventEmitter<any> = new EventEmitter();

  public isLoading = false;
  public authStatusSub: Subscription;

  constructor(private authService: AuthService) {}

  public ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe((authStatus) => {
      this.isLoading = authStatus;
    });

    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  public onLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(loginForm.value.username, loginForm.value.password);
  }

  public hide() {
    this.modalClosed.emit();
  }

  public openRegister() {
    this.regiterOpened.emit();
  }

  public onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.hide();
    }
  }
}

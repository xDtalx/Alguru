import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/settings.service';
import { AuthService } from '../auth.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-login',
  styleUrls: ['./login.component.less'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  @Output()
  public modalClosed: EventEmitter<any> = new EventEmitter();

  @Output()
  public registerOpened: EventEmitter<any> = new EventEmitter();

  public forgetPass: boolean;
  public isLoading = false;
  private authStatusSub: Subscription;
  private passwordChangedSub: Subscription;
  private navigateUrlOnLoginSub: Subscription;
  private navigateUrlOnLogin: string;

  constructor(private authService: AuthService, private settingsService: SettingsService) {
    this.navigateUrlOnLoginSub = this.settingsService
      .getNavigateUrlOnLoginObservable()
      .subscribe((url) => (this.navigateUrlOnLogin = url));
  }

  public ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe((authStatus) => {
      this.isLoading = authStatus;
    });
    this.passwordChangedSub = this.authService.getResetPasswordEmailSentListener().subscribe((sent) => {
      this.forgetPass = !sent;
      this.isLoading = false;
    });

    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public ngOnDestroy(): void {
    this.navigateUrlOnLoginSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  public onLogin(loginForm: NgForm): void {
    if (loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(loginForm.value.username, loginForm.value.password, this.navigateUrlOnLogin);
  }

  public hide(): void {
    this.modalClosed.emit();
  }

  public openRegister(): void {
    this.registerOpened.emit();
  }

  public showForgetPassForm(): void {
    this.forgetPass = true;
  }

  public hideForgetPassForm(): void {
    this.forgetPass = false;
  }

  public resetPassword(forgetPassForm: NgForm) {
    if (forgetPassForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.sendResetPasswordEmail(forgetPassForm.value.email);
  }

  public onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hide();
    }
  }
}

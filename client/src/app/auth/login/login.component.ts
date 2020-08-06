import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/settings.service';
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
  public registerOpened: EventEmitter<any> = new EventEmitter();

  public isLoading = false;
  private authStatusSub: Subscription;
  private navigateUrlOnLoginSub: Subscription;
  private navigateUrlOnLogin: string;

  constructor(private authService: AuthService, private settingsService: SettingsService) {
    this.navigateUrlOnLoginSub = this.settingsService
      .getNavigateUrlOnLoginObservable()
      .subscribe((url) => (this.navigateUrlOnLogin = url));
  }

  public ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe((authStatus) => {
      this.isLoading = authStatus;
    });

    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public ngOnDestroy() {
    this.navigateUrlOnLoginSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  public onLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(loginForm.value.username, loginForm.value.password, this.navigateUrlOnLogin);
  }

  public hide() {
    this.modalClosed.emit();
  }

  public openRegister() {
    this.registerOpened.emit();
  }

  public onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.hide();
    }
  }
}

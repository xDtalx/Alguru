import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-register',
  styleUrls: ['./register.component.less'],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit, OnDestroy {
  @Output()
  public modalClosed: EventEmitter<any> = new EventEmitter();

  private authStatusSub: Subscription;
  private userSavedSub: Subscription;
  public isLoading = false;

  constructor(private authService: AuthService) {}

  public ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe((authStatus) => {
      this.isLoading = authStatus;
    });

    this.userSavedSub = this.authService.getUserSavedListener().subscribe((isSaved) => {
      if (isSaved) {
        this.hide();
      }
    });

    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public ngOnDestroy() {
    this.userSavedSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  public onRegister(registerForm: NgForm) {
    if (registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.createUserAndSave(
      registerForm.value.username,
      registerForm.value.email,
      registerForm.value.password,
      registerForm.value.confirmPassword
    );
  }

  public onDelete(userId: string) {
    this.authService.deleteUser(userId);
  }

  public hide() {
    this.modalClosed.emit();
  }

  public onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.hide();
    }
  }
}

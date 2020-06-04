import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private authStatusSub: Subscription;
  private userSavedSub: Subscription;
  public isLoading = false;
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter();

  constructor(private authService: AuthService) {}

  ngOnInit() {
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

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  onRegister(registerForm: NgForm) {
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

  onDelete(userId: string) {
    this.authService.deleteUser(userId);
  }

  hide() {
    this.onCloseModal.emit();
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.hide();
    }
  }
}

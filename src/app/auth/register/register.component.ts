import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './register.component.html',
  styleUrls: [ './register.component.css' ]
})
export class RegisterComponent implements OnInit, OnDestroy {

  private authStatusSub: Subscription;
  public isLoading = false;

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

  onRegister(registerForm: NgForm) {
    if(registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.createUserAndSave(registerForm.value.username, registerForm.value.email, registerForm.value.password);
  }

  onDelete(userId: string) {
    this.authService.deleteUser(userId);
  }


}

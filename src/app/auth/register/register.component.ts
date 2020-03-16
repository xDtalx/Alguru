import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './register.component.html',
  styleUrls: [ './register.component.css' ]
})
export class RegisterComponent
{
  public isLoading = false;

  constructor(private authService: AuthService)
  {
  }

  onRegister(registerForm: NgForm)
  {
    if(registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.createUserAndSave(registerForm.value.username, registerForm.value.email, registerForm.value.password);
  }

  onDelete(userId: string)
  {
    this.authService.deleteUser(userId);
  }
}

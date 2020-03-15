import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '../users.service';
import { NgForm } from '@angular/forms';
import { User } from '../user.model';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: [ './user-register.component.css' ]
})
export class UserRegisterComponent implements OnInit
{
  // used in order to unsubscribe from the service when the page, which the list in, not shown
  constructor(private usersService: UsersService)
  {
  }

  ngOnInit()
  {
    console.log(this.usersService.getUsers());
  }

  onRegister(registerForm: NgForm)
  {
      this.usersService.createUser(registerForm.value.username, registerForm.value.password);
  }

  onDelete(userId: string)
  {
    this.usersService.deleteUser(userId);
  }
}

import {Component, Input, NgModule} from '@angular/core';

import {BrowserModule} from "@angular/platform-browser";



@Component({
  selector: 'login-modal',
  templateUrl: './loginModal.component.html',
  styleUrls: ['./loginModal.component.less'],
  entryComponents: [
    LoginModalComponent
  ]
})
export class LoginModalComponent  {
  @Input() name;


  constructor() {}

}

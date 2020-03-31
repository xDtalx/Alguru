import { Component, OnInit, OnDestroy } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

 enum ModalTypes{
  LoginModal ='loginModal',
  RegisterModal='registerModal'
}

@Component({
  selector: 'home-page',
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.less']
})
export class HomePageComponent {
  showLoginModal: boolean;
  shownRegister: boolean;
  showModal : boolean;
  ModalTypes = ModalTypes;

  constructor(private formBuilder: FormBuilder) {
  }

  show(type : ModalTypes) {
    this.showModal = true;
    if(type==ModalTypes.LoginModal) {
      this.showLoginModal = true;
    }
    else{
      this.shownRegister = true;
    }
  }

  hide() {
    this.showModal = false;
    this.showLoginModal = false;
    this.shownRegister = false;
  }
}


import { Component, OnInit, OnDestroy } from '@angular/core';
import {LoginModalComponent} from "../loginModal/loginModal.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'home-page',
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.less'],
  entryComponents: [
    LoginModalComponent
  ]
})
export class HomePageComponent {
  private showLoginPage = false;
  closeResult = '';
  showModal: boolean;
  registerForm: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {
  }

  show() {
    this.showModal = true;
  }

  hide() {
    this.showModal = false;
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // onLogInClick() {
  //   // ,{ centered: true }
  //   const modalRef = this.modalService.open(LoginModalComponent);
  //   modalRef.componentInstance.name = 'Login';
  // }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    if (this.submitted) {
      this.showModal = false;
    }
  }

  get f() { return this.registerForm.controls; }
}


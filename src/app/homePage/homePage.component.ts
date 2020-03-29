import { Component, OnInit, OnDestroy } from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {LoginModalComponent} from "../loginModal/loginModal.component";


@Component({
  selector: 'home-page',
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.less'],
  entryComponents: [
    LoginModalComponent
  ]
})
export class HomePageComponent  {
  private showLoginPage = false;
  closeResult = '';
  constructor(private modalService: NgbModal) {}

  onLogInClick(){
    const modalRef = this.modalService.open(LoginModalComponent,{ centered: true });
    modalRef.componentInstance.name = 'Login';
  }
}

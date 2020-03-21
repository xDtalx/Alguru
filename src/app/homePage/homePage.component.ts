import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {LoginModalComponent} from "../loginModal/loginModal.component";

@Component({
  selector: 'home-page',
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.less']
})
export class HomePageComponent  {
  private showLoginPage = false;

  constructor(public matDialog: MatDialog) { }

  onLogInClick(){
    // const dialogConfig = new MatDialogConfig();
    // // The user can't close the dialog by clicking outside its body
    // dialogConfig.disableClose = true;
    // dialogConfig.id = "modal-component";
    // dialogConfig.height = "350px";
    // dialogConfig.width = "600px";
    // // https://material.angular.io/components/dialog/overview
    // const modalDialog = this.matDialog.open(LoginModalComponent, dialogConfig);
  }
}

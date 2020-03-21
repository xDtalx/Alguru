import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'login-modal',
  templateUrl: './loginModal.component.html',
  styleUrls: ['./loginModal.component.less']
})
export class LoginModalComponent  {

  constructor(public dialogRef: MatDialogRef<LoginModalComponent>) { }
  actionFunction() {
    alert("You have logged out.");
    this.closeModal();
  }

  closeModal() {
    this.dialogRef.close();
  }
}

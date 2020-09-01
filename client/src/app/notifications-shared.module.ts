import { NgModule } from '@angular/core';
import { NotificationCenterComponent } from './notification-center/notification-center.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [NotificationCenterComponent],
  exports: [NotificationCenterComponent]
})
export class SharedModule {}

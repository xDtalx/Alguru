import { Component, EventEmitter, Input, Output } from '@angular/core';
import { INotification } from './notification.model';

@Component({
  selector: 'app-notifications-center',
  styleUrls: ['./notification-center.component.css'],
  templateUrl: './notification-center.component.html'
})
export class NotificationCenterComponent {
  @Output()
  public newNotificationsCountUpdate = new EventEmitter<number>();

  @Input()
  public seen = 'false';

  @Input()
  public notSeenColor = 'rgb(102, 181, 255)';

  @Input()
  public notificationColor = 'white';

  @Input()
  public fontColor = 'black';

  @Input()
  public notifications: INotification[] = [];
}

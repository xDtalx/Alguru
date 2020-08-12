import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';
import { INotification } from './notification.model';
import { NotificationService } from './notification.service';

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

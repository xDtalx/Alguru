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
export class NotificationCenterComponent implements OnInit, OnDestroy, OnChanges {
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

  private notificationsUpdatedSub: Subscription;

  constructor(private notificationsService: NotificationService) {}

  public ngOnDestroy(): void {
    this.notificationsUpdatedSub.unsubscribe();
  }

  public ngOnInit(): void {
    this.notificationsUpdatedSub = this.notificationsService
      .getNotificationsUpdatedListener()
      .subscribe((notifications) => {
        this.notifications = notifications;
        this.updateNewNotificationsCount();
      });
    this.notificationsService.updateNotifications();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.seen) {
      if (changes.seen.currentValue === 'true') {
        this.notificationsService.setNotificationsSeen();
        this.newNotificationsCountUpdate.emit(0);
      }
    }
  }

  private updateNewNotificationsCount(): void {
    let count = 0;

    this.notifications.forEach((notification) => {
      if (!notification.seen) {
        count++;
      }
    });

    this.newNotificationsCountUpdate.emit(count);
  }
}

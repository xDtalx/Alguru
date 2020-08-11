import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { INotification } from './notification.model';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notifications-center',
  styleUrls: ['./notification-center.component.css'],
  templateUrl: './notification-center.component.html'
})
export class NotificationCenterComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  public seen: string;

  @Input()
  public notSeenColor = 'rgb(102, 181, 255)';

  @Input()
  public notificationColor = 'white';

  @Input()
  public fontColor = 'black';

  @Input()
  public notifications: INotification[] = [
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    },
    {
      content: 'test',
      date: 'test',
      seen: false,
      title: 'test'
    }
  ];

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
      });
    this.notificationsService.updateNotifications();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.seen) {
      this.notifications.forEach((notification) => {
        notification.seen = changes.seen.currentValue === 'true';
      });
    }
  }
}

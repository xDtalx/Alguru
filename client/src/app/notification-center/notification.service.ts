import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { INotification } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsUpdated: Subject<INotification[]>;
  private notifications: INotification[] = [
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

  public getNotificationsUpdatedListener(): Observable<INotification[]> {
    if (!this.notificationsUpdated) {
      this.notificationsUpdated = new Subject<INotification[]>();
    }

    return this.notificationsUpdated.asObservable();
  }

  public setNotificationsSeen(): void {
    this.notifications.forEach((notification) => {
      notification.seen = true;
    });
    this.notificationsUpdated.next(this.notifications);
  }

  public updateNotifications(): void {
    if (!this.notificationsUpdated) {
      this.notificationsUpdated = new Subject<INotification[]>();
    }

    this.notificationsUpdated.next(this.notifications);
  }
}

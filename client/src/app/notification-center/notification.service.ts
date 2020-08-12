import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { INotification } from './notification.model';

const BACKEND_URL = environment.apiUrl + '/users';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsUpdated: Subject<INotification[]>;
  private notifications: INotification[] = [];

  constructor(private http: HttpClient) {}

  public getNotificationsUpdatedListener(): Observable<INotification[]> {
    if (!this.notificationsUpdated) {
      this.notificationsUpdated = new Subject<INotification[]>();
    }

    return this.notificationsUpdated.asObservable();
  }

  public setNotificationsSeen(): void {
    let updateBackend = false;

    this.notifications.forEach((notification) => {
      if (!notification.seen) {
        updateBackend = true;
      }

      notification.seen = true;
    });
    this.notificationsUpdated.next([...this.notifications]);

    if (updateBackend) {
      this.http.put(BACKEND_URL + '/notifications', null).subscribe();
    }
  }

  public updateNotifications(): void {
    if (!this.notificationsUpdated) {
      this.notificationsUpdated = new Subject<INotification[]>();
    }

    this.http
      .get<
        {
          _id: string;
          content: string;
          createdAt: Date;
          seen: boolean;
          sender: string;
          title: string;
          url: string;
        }[]
      >(BACKEND_URL + '/notifications')
      .pipe(
        map((notifications) => {
          return notifications.map((notification) => {
            return {
              content: notification.content,
              createdAt: notification.createdAt,
              id: notification._id,
              seen: notification.seen,
              sender: notification.sender,
              title: notification.title,
              url: notification.url
            };
          });
        })
      )
      .subscribe((response) => {
        this.notifications = response;
        this.notificationsUpdated.next([...this.notifications]);
      });
  }
}

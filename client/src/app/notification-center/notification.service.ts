import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { INotification } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsUpdated: Subject<INotification[]>;
  private notifications: INotification[];

  public getNotificationsUpdatedListener(): Observable<INotification[]> {
    if (!this.notificationsUpdated) {
      this.notificationsUpdated = new Subject<INotification[]>();
    }

    return this.notificationsUpdated.asObservable();
  }

  /*eslint-disable */
  public updateNotifications(): void {}
  /* eslint-enable */
}

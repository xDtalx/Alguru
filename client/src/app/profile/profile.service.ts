import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUserStats } from './user-stats.model';
import { UserInfoModel } from './user-info.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private urlUpdated = new Subject<string>();
  private statsUpdated = new Subject<IUserStats>();
  private infoUpdated = new Subject<UserInfoModel>();

  constructor(private http: HttpClient) {}

  public updateUserInfo(userInfo: UserInfoModel) {
    this.http.put<UserInfoModel>(`${environment.apiUrl}/users/update`, userInfo).subscribe((info) => {
      this.infoUpdated.next(info);
    });
  }

  public getUserInfo(username: string): void {
    this.http
      .get<{ username: string; mail: string; socials: [] }>(`${environment.apiUrl}/users/info/${username}`)
      .subscribe((info) => {
        const userInfo = new UserInfoModel();
        userInfo.username = info.username;
        userInfo.mail = info.mail;
        userInfo.socials = info.socials;
        this.infoUpdated.next(userInfo);
      });
  }

  public getInfoUpdatedListener(): Observable<UserInfoModel> {
    return this.infoUpdated.asObservable();
  }

  public getStatsUpdatedListener(): Observable<IUserStats> {
    return this.statsUpdated.asObservable();
  }

  public getURLUpdatedListener(): Observable<string> {
    return this.urlUpdated.asObservable();
  }

  public uploadImage(blob): void {
    const formData = new FormData();
    formData.append('image', blob);

    this.http
      .post<{
        message: string;
        url: string;
      }>(`${environment.apiUrl}/image/upload`, formData)
      .subscribe((res) => {
        this.urlUpdated.next(res.url);
      });
  }

  public updateSolvedQuestions(): void {
    this.http.get<IUserStats>(environment.apiUrl + '/users/stats').subscribe((stats) => this.statsUpdated.next(stats));
  }
}

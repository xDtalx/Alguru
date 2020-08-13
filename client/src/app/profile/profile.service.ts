import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUserStats } from './user-stats.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private urlUpdated = new Subject<string>();
  private statsUpdated = new Subject<IUserStats>();

  constructor(private http: HttpClient) {}

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

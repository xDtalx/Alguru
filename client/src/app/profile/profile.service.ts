import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/image';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private urlUpdated = new Subject<string>();

  constructor(private http: HttpClient) {}

  getURLUpdatedListener() {
    return this.urlUpdated.asObservable();
  }

  uploadImage(blob): void {
    const formData = new FormData();
    formData.append('image', blob);

    this.http
      .post<{
        message: string;
        url: string;
      }>(`${BACKEND_URL}/upload`, formData)
      .subscribe((res) => {
        this.urlUpdated.next(res.url);
      });
  }
}

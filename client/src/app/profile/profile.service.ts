import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/image';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  uploadImage(image) {
    const formData = new FormData();
    formData.append('image', image);

    this.http.post<any>(BACKEND_URL + '/upload', formData).subscribe(
      (res) => console.log(res),
      (err) => console.log(err)
    );
  }
}

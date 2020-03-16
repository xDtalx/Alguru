import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { RegisterAuthData } from './register-auth-data.model';
import { LoginAuthData } from './login-auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root'})
export class AuthService {

  private isAuth:boolean = false;
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any;
  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuth;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUsers() {
    this.http
      .get<any>('http://localhost:3000/api/users')
      .pipe(map(usersData => {
          return usersData.map(user =>
            {
              return {
                id: user._id,
                username: user.username,
                hashedPassword: user.hashedPassword
              }
            });
        }))
      .subscribe(transUsers => {
          console.log(transUsers);
        });
  }

  createUserAndSave(username: string, email: string, password: string) {
    const authData: RegisterAuthData = {
      username: username,
      email: email,
      password: password
    }

    this.saveUser(authData);
  }

  saveUser(authData: RegisterAuthData) {
    this.http.post('http://localhost:3000/api/users/register', authData)
      .subscribe(responseData => {
        console.log(responseData);
      });
  }

  deleteUser(id: string) {
    this.http.delete('http://localhost:3000/api/users/' + id)
      .subscribe(() => {
        console.log('User deleted');
      });
  }

  login(username: string, password: string) {
    const authData: LoginAuthData = {
      username: username,
      password: password
    }

    this.http.post<{ token: string, expiresIn: number }>('http://localhost:3000/api/users/login', authData)
      .subscribe(response => {
        this.token = response.token;

        if(this.token) {
          this.setAuthTimer(response.expiresIn);
          this.isAuth = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + response.expiresIn * 1000);
          this.saveAuthData(this.token, expirationDate);
          this.router.navigate(['/']);
        }
      });
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();

    if(!authInfo) {
      return;
    }

    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();

    if(expiresIn > 0) {
      this.token = authInfo.token;
      this.isAuth = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuth = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');

    if(!(token && expirationDate)) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }

  private setAuthTimer(durationInSeconds: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, durationInSeconds * 1000);
  }
}

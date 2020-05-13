import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { RegisterAuthData } from './register-auth-data.model';
import { LoginAuthData } from './login-auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/users';

@Injectable({ providedIn: 'root'})
export class AuthService {

  private authStatusListener = new Subject<boolean>();
  private adminListener = new Subject<boolean>();
  private authErrorListener = new Subject<string[]>();
  private isAuth: boolean = false;
  private isAdmin: boolean = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private errors: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getAdminListener() {
    return this.adminListener.asObservable();
  }

  getAuthErrorListener() {
    return this.authErrorListener.asObservable();
  }

  addErrorMessages(errors: string[]) {
    if(errors && errors.length > 0) {
      errors.forEach(error => this.errors.push(error));
      this.authErrorListener.next([...this.errors]);
    }
  }

  getIsAuth() {
    return this.isAuth;
  }

  getIsAdmin() {
    return this.isAdmin;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUsers() {
    this.http
      .get<any>(BACKEND_URL)
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
    this.errors = [];
    this.http.post(BACKEND_URL + '/register', authData)
      .subscribe(() => {
        this.router.navigate(['/login']);
      }, errors => {
        this.authErrorListener.next([...this.errors]);
        this.authStatusListener.next(false);
      });
  }

  deleteUser(id: string) {
    this.http.delete(BACKEND_URL + '/' + id)
      .subscribe(() => {
        console.log('User deleted');
      });
  }

  login(username: string, password: string) {
    this.errors = [];

    const authData: LoginAuthData = {
      username: username,
      password: password
    }

    console.log(authData);

    this.http.post<{ token: string, expiresIn: number, userId: string, isAdmin: boolean }>(BACKEND_URL + '/login', authData)
      .subscribe(response => {
        console.log(response);
        this.token = response.token;

        if(this.token) {
          this.userId = response.userId;
          this.setAuthTimer(response.expiresIn);
          this.isAuth = true;
          this.isAdmin = response.isAdmin;
          this.authStatusListener.next(true);
          this.adminListener.next(this.isAdmin);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + response.expiresIn * 1000);
          this.saveAuthData(this.token, expirationDate, this.userId, String(this.isAdmin));
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
        this.adminListener.next(false);
      });
  }

  getUserId() {
    return this.userId;
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
      this.isAdmin = authInfo.isAdmin === "true";
      this.userId = authInfo.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.adminListener.next(this.isAdmin);
    }
  }

  logout() {
    this.errors = [];
    this.token = null;
    this.isAuth = false;
    this.isAdmin = false;
    this.authStatusListener.next(false);
    this.adminListener.next(false);
    this.router.navigate(['/']);
    this.clearAuthData();
    this.userId = null;
    clearTimeout(this.tokenTimer);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, isAdmin: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('isAdmin', isAdmin);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin');

    if(!(token && expirationDate)) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      isAdmin: isAdmin
    }
  }

  private setAuthTimer(durationInSeconds: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, durationInSeconds * 1000);
  }
}

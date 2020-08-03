import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ILoginAuthData } from './login-auth-data.model';
import { IRegisterAuthData } from './register-auth-data.model';

const BACKEND_URL = environment.apiUrl + '/users';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStatusListener = new Subject<boolean>();
  private adminListener = new Subject<boolean>();
  private authErrorListener = new Subject<string[]>();
  private userSavedListener = new Subject<boolean>();

  private isAuth = false;
  private isAdmin = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private username: string;
  private errors: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  public getToken() {
    return this.token;
  }

  public getUserSavedListener() {
    return this.userSavedListener.asObservable();
  }

  public getUsername() {
    if (!this.username) {
      this.username = localStorage.getItem('username');
    }

    return this.username;
  }

  public getAdminListener() {
    return this.adminListener.asObservable();
  }

  public getAuthErrorListener() {
    return this.authErrorListener.asObservable();
  }

  public addErrorMessages(errors: string[]) {
    if (errors && errors.length > 0 && errors.forEach) {
      this.errors = [];
      errors.forEach((error) => this.errors.push(error));
      this.authErrorListener.next([...this.errors]);
    }
  }

  public resetErrorMessages() {
    this.errors = [];
    this.authErrorListener.next([...this.errors]);
  }

  public getIsAuth() {
    return this.isAuth;
  }

  public getIsAdmin() {
    return this.isAdmin;
  }

  public getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  public getUsers() {
    this.http
      .get<any>(BACKEND_URL)
      .pipe(
        map((usersData) => {
          return usersData.map((user) => {
            return {
              hashedPassword: user.hashedPassword,
              id: user._id,
              username: user.username
            };
          });
        })
      )
      .subscribe((transUsers) => {
        console.log(transUsers);
      });
  }

  public createUserAndSave(username: string, email: string, password: string, confirmPassword: string) {
    const authData: IRegisterAuthData = {
      confirmPassword,
      email,
      password,
      username
    };

    this.saveUser(authData);
  }

  public saveUser(authData: IRegisterAuthData) {
    this.errors = [];
    this.http.post(BACKEND_URL + '/register', authData).subscribe(
      () => {
        this.userSavedListener.next(true);
        this.router.navigate(['/']);
      },
      (errors) => {
        this.authErrorListener.next([...this.errors]);
        this.authStatusListener.next(false);
      }
    );
  }

  public deleteUser(id: string) {
    this.http.delete(BACKEND_URL + '/' + id).subscribe(() => {
      console.log('User deleted');
    });
  }

  public login(username: string, password: string, urlToNavigateAfter?: string) {
    this.errors = [];

    const authData: ILoginAuthData = {
      password,
      username
    };

    this.http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        username: string;
        isAdmin: boolean;
      }>(BACKEND_URL + '/login', authData)
      .subscribe(
        (response) => {
          this.token = response.token;

          if (this.token) {
            this.userId = response.userId;
            this.setAuthTimer(response.expiresIn);
            this.isAuth = true;
            this.username = response.username;
            this.isAdmin = response.isAdmin;
            this.authStatusListener.next(true);
            this.adminListener.next(this.isAdmin);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + response.expiresIn * 1000);
            this.saveAuthData(this.token, expirationDate, this.userId, this.username, String(this.isAdmin));

            if (urlToNavigateAfter) {
              this.router.navigate([urlToNavigateAfter]);
            }
          }
        },
        () => {
          this.authStatusListener.next(false);
          this.adminListener.next(false);
        }
      );
  }

  public getUserId() {
    return this.userId;
  }

  public autoAuthUser() {
    const authInfo = this.getAuthData();

    if (!authInfo) {
      return;
    }

    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInfo.token;
      this.isAuth = true;
      this.isAdmin = authInfo.isAdmin === 'true';
      this.userId = authInfo.userId;
      this.username = authInfo.username;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.adminListener.next(this.isAdmin);
    }
  }

  public logout(url?: string) {
    this.errors = [];
    this.token = null;
    this.isAuth = false;
    this.isAdmin = false;
    this.username = null;
    this.authStatusListener.next(false);
    this.adminListener.next(false);
    this.clearAuthData();
    this.userId = null;
    clearTimeout(this.tokenTimer);

    if (url) {
      this.router.navigate([url]);
    }
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, username: string, isAdmin: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('isAdmin', isAdmin);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin');
    const username = localStorage.getItem('username');

    if (!(token && expirationDate)) {
      return;
    }

    return {
      expirationDate: new Date(expirationDate),
      isAdmin,
      token,
      userId,
      username
    };
  }

  private setAuthTimer(durationInSeconds: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, durationInSeconds * 1000);
  }
}

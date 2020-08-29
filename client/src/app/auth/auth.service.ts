import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IAuthData } from './auth-data.model';
import { ILoginAuthData } from './login-auth-data.model';
import { IRegisterAuthData } from './register-auth-data.model';

const BACKEND_URL = environment.apiUrl + '/users';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStatusListener = new Subject<boolean>();
  private verifiedListener = new Subject<boolean>();
  private adminListener = new Subject<boolean>();
  private authErrorListener = new Subject<string[]>();
  private userSavedListener = new Subject<boolean>();
  private emailVerifiedListener = new Subject<boolean>();
  private resetPasswordEmailSentListener = new Subject<boolean>();
  private passwordChangedListener = new Subject<boolean>();
  private isAuth: boolean;
  private authData: IAuthData = {};
  private tokenTimer: any;
  private errors: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  public resetPassword(resetToken: string, password: string, confirmPassword: string) {
    this.http.post(BACKEND_URL + '/login/reset/' + resetToken, { password, confirmPassword }).subscribe(
      () => {
        this.passwordChangedListener.next(true);
      },
      () => {
        this.passwordChangedListener.next(false);
      }
    );
  }

  public getVerifiedListener(): Observable<boolean> {
    return this.verifiedListener.asObservable();
  }

  public sendResetPasswordEmail(email: string): void {
    this.http.post(BACKEND_URL + '/login/reset', { email }).subscribe(
      () => {
        this.resetPasswordEmailSentListener.next(true);
      },
      () => {
        this.resetPasswordEmailSentListener.next(false);
      }
    );
  }

  public getResetPasswordEmailSentListener(): Observable<boolean> {
    return this.resetPasswordEmailSentListener.asObservable();
  }

  public getPasswordChangedListener(): Observable<boolean> {
    return this.passwordChangedListener.asObservable();
  }

  public resendVarificationEmail(): void {
    this.http.post(BACKEND_URL + '/verify/resend', null).subscribe();
  }

  public isVerified(): boolean {
    return this.authData.verified;
  }

  public verifyEmail(verifyToken: string): void {
    this.http.get<{ message; token; expiresIn }>(BACKEND_URL + `/verify/${verifyToken}`).subscribe((resposne) => {
      this.emailVerifiedListener.next(true);
      this.authData.token = resposne.token;
      this.authData.verified = true;
      this.verifiedListener.next(true);
      this.setAuthTimer(resposne.expiresIn);
      localStorage.setItem('token', resposne.token);
      localStorage.setItem('verified', 'true');
    });
  }

  public getToken() {
    return this.authData.token;
  }

  public getUserSavedListener() {
    return this.userSavedListener.asObservable();
  }

  public getEmailVerifiedListener() {
    return this.emailVerifiedListener.asObservable();
  }

  public getUsername() {
    if (!this.authData.username) {
      this.authData.username = localStorage.getItem('username');
    }

    return this.authData.username;
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
    return this.authData.isAdmin;
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

    this.http.post<IAuthData>(BACKEND_URL + '/login', authData).subscribe(
      (response: IAuthData) => {
        this.saveAuthResponse(response);

        if (urlToNavigateAfter) {
          this.router.navigate([urlToNavigateAfter]);
        }
      },
      () => {
        this.authStatusListener.next(false);
        this.adminListener.next(false);
      }
    );
  }

  private saveAuthResponse(authData: IAuthData): void {
    this.authData.token = authData.token;

    if (this.authData.token) {
      const now = new Date();
      authData.expirationDate = new Date(now.getTime() + authData.expiresIn * 1000);
      this.saveAuthData(authData);
      this.setAuthTimer(authData.expiresIn);
      this.isAuth = true;
      this.authStatusListener.next(true);
      this.adminListener.next(this.authData.isAdmin);
      this.verifiedListener.next(this.authData.verified);
    }
  }

  public getUserId() {
    return this.authData.userId;
  }

  public autoAuthUser() {
    const authData = this.getAuthData();

    if (!authData) {
      return;
    }

    const now = new Date();
    const expiresIn = authData.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.authData = authData;
      this.isAuth = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.adminListener.next(this.authData.isAdmin);
      this.verifiedListener.next(this.authData.verified);
    }
  }

  public logout(url?: string) {
    this.errors = [];
    this.isAuth = false;
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.authStatusListener.next(false);
    this.adminListener.next(false);
    if (url) {
      this.router.navigate([url]);
    }
  }

  private saveAuthData(authData: IAuthData) {
    this.authData = authData;
    localStorage.setItem('token', authData.token);
    localStorage.setItem('expiration', authData.expirationDate.toISOString());
    localStorage.setItem('userId', authData.userId);
    localStorage.setItem('username', authData.username);
    localStorage.setItem('isAdmin', String(authData.isAdmin));
    localStorage.setItem('verified', String(authData.verified));
  }

  private clearAuthData() {
    this.authData = {};

    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('verified');
  }

  private getAuthData(): IAuthData {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin');
    const username = localStorage.getItem('username');
    const verified = localStorage.getItem('verified');

    if (!(token && expirationDate)) {
      return;
    }

    return {
      expirationDate: new Date(expirationDate),
      isAdmin: isAdmin === 'true',
      token,
      userId,
      username,
      verified: verified === 'true'
    };
  }

  private setAuthTimer(durationInSeconds: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, durationInSeconds * 1000);
  }
}

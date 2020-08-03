import { Injectable } from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private showSmallHeader: Observable<boolean>;
  private navigateUrlOnLogout: Observable<string>;
  private navigateUrlOnLogin: Observable<string>;
  private showSmallHeaderOnLogout: Observable<boolean>;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.showSmallHeader = this.getDataPropertyAsObservable<boolean>('showSmallHeader');
    this.navigateUrlOnLogout = this.getDataPropertyAsObservable<string>('navigateUrlOnLogout');
    this.showSmallHeaderOnLogout = this.getDataPropertyAsObservable<boolean>('showSmallHeaderOnLogout');
    this.navigateUrlOnLogin = this.getDataPropertyAsObservable<string>('navigateUrlOnLogin');
  }

  private getDataPropertyAsObservable<T>(propertyName: string): Observable<T> {
    return this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }

        return route;
      }),
      mergeMap((route) => route.data),
      map((data: Data) => (data.hasOwnProperty(propertyName) ? data[propertyName] : false))
    );
  }

  public getSmallHeaderObservable() {
    return this.showSmallHeader;
  }

  public getSmallHeaderOnLogoutObservable() {
    return this.showSmallHeaderOnLogout;
  }

  public getNavigateUrlOnLoginObservable() {
    return this.navigateUrlOnLogin;
  }

  public getNavigateUrlOnLogoutObservable() {
    return this.navigateUrlOnLogout;
  }
}

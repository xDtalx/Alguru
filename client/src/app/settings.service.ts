import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root'})
export class SettingsService {
    private showSmallHeader: Observable<boolean>;

    constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    
        this.showSmallHeader = this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            map(() => activatedRoute),
            map(route => {
            while (route.firstChild) {
                route = route.firstChild;
            }

            return route;
            }),
            mergeMap(route => route.data),
            map(data => data.hasOwnProperty('showSmallHeader') ? data.showSmallHeader : false)
        )
    
    }

    getSmallHeaderObservable() {
        return this.showSmallHeader;
    }
}
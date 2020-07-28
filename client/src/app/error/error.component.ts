import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-error',
  styleUrls: ['./error.component.css'],
  templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit, OnDestroy {
  public errors: string[];
  private authErrorsSub: Subscription;

  constructor(private authService: AuthService) {}

  public ngOnDestroy() {
    this.authErrorsSub.unsubscribe();
  }

  public ngOnInit() {
    this.authErrorsSub = this.authService.getAuthErrorListener().subscribe((errors: string[]) => {
      this.errors = errors;
    });
  }
}

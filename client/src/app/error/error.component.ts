import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit, OnDestroy {
  public errors: string[];
  private authErrorsSub: Subscription;

  constructor(private authService: AuthService) {}

  ngOnDestroy() {
    this.authErrorsSub.unsubscribe();
  }

  ngOnInit() {
    this.authErrorsSub = this.authService.getAuthErrorListener().subscribe((errors: string[]) => {
      this.errors = errors;
    });
  }
}

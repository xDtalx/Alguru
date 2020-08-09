import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  styleUrls: ['./email-verification.component.css'],
  templateUrl: './email-verification.component.html'
})
export class EmailVerificationComponent implements OnInit, OnDestroy {
  private emailVerifiedSub: Subscription;
  private verifyToken: string;
  public verified: boolean;

  constructor(private route: ActivatedRoute, private authService: AuthService) {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('verifyToken')) {
        this.verifyToken = paramMap.get('verifyToken');
      }
    });
  }

  public ngOnDestroy(): void {
    this.emailVerifiedSub.unsubscribe();
  }

  public ngOnInit(): void {
    if (this.verifyToken) {
      this.emailVerifiedSub = this.authService
        .getEmailVerifiedListener()
        .subscribe((verified) => (this.verified = verified));
      this.authService.verifyEmail(this.verifyToken);
    }
  }
}

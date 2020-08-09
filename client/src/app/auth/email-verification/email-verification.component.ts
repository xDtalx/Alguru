import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  styleUrls: ['./email-verification.component.css'],
  templateUrl: './email-verification.component.html'
})
export class EmailVerificationComponent implements OnInit {
  private verifyToken: string;
  public verified: boolean;

  constructor(private route: ActivatedRoute, private authService: AuthService) {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('verifyToken')) {
        this.verifyToken = paramMap.get('verifyToken');
      }
    });
  }

  public ngOnInit(): void {
    if (this.verifyToken) {
      this.authService.verifyEmail(this.verifyToken).subscribe(() => {
        this.verified = true;
      });
    }
  }
}

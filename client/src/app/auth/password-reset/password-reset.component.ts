import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./password-reset.component.css'],
  templateUrl: './password-reset.component.html'
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  private resetToken: string;
  private resetPasswordSub: Subscription;
  public isLoading: boolean;

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('resetToken')) {
        this.resetToken = paramMap.get('resetToken');
      }
    });
  }

  public ngOnDestroy(): void {
    this.resetPasswordSub.unsubscribe();
  }

  public ngOnInit(): void {
    this.resetPasswordSub = this.authService.getPasswordChangedListener().subscribe((changed) => {
      this.isLoading = false;

      if (changed) {
        this.router.navigate(['/']);
      }
    });
  }

  public resetPassword(resetPasswordForm: NgForm): void {
    if (resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const password = resetPasswordForm.value.password;
    const confirmPassword = resetPasswordForm.value.confirmPassword;
    this.authService.resetPassword(this.resetToken, password, confirmPassword);
  }
}

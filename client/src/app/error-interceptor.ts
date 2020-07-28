import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler) {
    // handle returns the response observable stream.
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage: string[] = ['An unknown error occurred!'];

        if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.errors) {
          errorMessage = [];
          // tslint:disable-next-line: no-shadowed-variable
          error.error.errors.forEach((error) => {
            errorMessage.push(error.msg);
          });
        }

        this.authService.addErrorMessages(errorMessage);

        return throwError(error);
      })
    );
  }
}

import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // handle returns the response observable stream.
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage: string[] = ['An unknown error occurred!'];

        if(error.error.message) {
          errorMessage = error.error.message;
        } else if(error.error.errors) {
          errorMessage = [];
          error.error.errors.forEach(error => {
            errorMessage.push(error.msg);
          });
        }

        this.authService.addErrorMessages(errorMessage);

        return throwError(error);
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ExecuteResponse } from './execute-response.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { StringFormat } from 'src/utils/string-utils';

@Injectable({ providedIn: 'root'})
export class CodeService {

  private executeResponseListener = new Subject<ExecuteResponse>();

  constructor(private http: HttpClient, private router: Router) {}

  getExecuteResponseListener() {
    return this.executeResponseListener.asObservable();
  }

  runCode(lang: string, code: string, tests: string) {
    let runRequest = {
      lang: lang,
      code: code,
      tests: tests
    }

    this
    .http
    .post<ExecuteResponse>(environment.runCodeApi + "/execute", runRequest)
    .subscribe(output => {
      this.executeResponseListener.next(output);
    });
  }
}

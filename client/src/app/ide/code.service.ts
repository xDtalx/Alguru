import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExecuteResponse } from './execute-response.model';

@Injectable({ providedIn: 'root' })
export class CodeService {
  private executeResponseListener = new Subject<ExecuteResponse>();

  constructor(private http: HttpClient, private router: Router) {}

  public getExecuteResponseListener() {
    return this.executeResponseListener.asObservable();
  }

  public runCode(questionId: string, lang: string, code: string, tests: string) {
    const runRequest = {
      code,
      lang,
      questionId,
      tests
    };

    this.http.post<ExecuteResponse>(environment.runCodeApi + '/execute', runRequest).subscribe((output) => {
      this.executeResponseListener.next(output);
    });
  }
}

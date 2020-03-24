import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ExecuteResponse } from './execute-response.model';
import { SolutionTemplateResponse } from './solution-template.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root'})
export class CodeService {

  private executeResponseListener = new Subject<ExecuteResponse>();
  private solutionTemplateListener = new Subject<SolutionTemplateResponse>();

  constructor(private http: HttpClient, private router: Router) {}

  getExecuteResponseListener() {
    return this.executeResponseListener.asObservable();
  }

  getSolutionTemplateListener() {
    return this.solutionTemplateListener.asObservable();
  }

  getSolutionTemplate(lang) {
    this
    .http
    .get<SolutionTemplateResponse>(environment.apiUrl + "/code/template/" + lang)
    .subscribe(template => this.solutionTemplateListener.next(template));
  }

  runCode(lang: String, code: string) {
    let runRequest = {
      lang: lang,
      code: code
    }

    this
    .http
    .post<ExecuteResponse>(environment.apiUrl + "/code/execute", runRequest)
    .subscribe(output => {
      this.executeResponseListener.next(output);
    });
  }
}

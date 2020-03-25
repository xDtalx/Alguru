import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ExecuteResponse } from './execute-response.model';
import { SolutionTemplateResponse } from './solution-template.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { StringFormat } from 'src/utils/string-utils';

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
    const urlType = StringFormat(environment.GETUrlType, 'lang');

    this
    .http
    .get<SolutionTemplateResponse>(environment.runCodeApi + "/template" + urlType + lang)
    .subscribe(template => this.solutionTemplateListener.next(template));
  }

  runCode(lang: string, code: string) {
    let runRequest = {
      lang: lang,
      code: code
    }

    this
    .http
    .post<ExecuteResponse>(environment.runCodeApi + "/execute", runRequest)
    .subscribe(output => {
      this.executeResponseListener.next(output);
    });
  }
}

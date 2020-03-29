import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CodeService } from './code.service';
import { SolutionTemplateResponse } from './solution-template.model';
import { ExecuteResponse } from './execute-response.model';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: [ './code-editor.component.css' ]
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  private codeListenerSubs: Subscription;
  private executeListenerSubs: Subscription;
  solutionTemplate: SolutionTemplateResponse;
  executeResponse: ExecuteResponse;
  currentOutput: string;
  lang: string = "java";

  constructor(private codeService: CodeService) {}

  ngOnInit() {
    this.executeResponse = { message: "", output: "", errors: "" };
    this.currentOutput = "";

    this.codeListenerSubs =
    this.codeService
    .getSolutionTemplateListener()
    .subscribe(template => this.solutionTemplate = template);

    this.codeService.getSolutionTemplate("java");

    this.executeListenerSubs =
    this.codeService
    .getExecuteResponseListener()
    .subscribe(response => {
      this.executeResponse = response;

      if(this.executeResponse !== null) {
        this.currentOutput = "Custom> " + this.executeResponse.message;
      }
    });
  }

  ngOnDestroy() {
    this.codeListenerSubs.unsubscribe();
    this.executeListenerSubs.unsubscribe();
  }

  onRunCode(code: string) {
    this.codeService.runCode(this.lang, code);
  }

  onCustomClick() {
    this.currentOutput = "Custom> " + this.executeResponse.message;
  }

  onRawOuputClick() {
    this.currentOutput = "Output> " + (this.executeResponse.errors === '' ? this.executeResponse.output : this.executeResponse.errors);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CodeService } from './code.service';
import { ExecuteResponse } from './execute-response.model';
import { NgModel } from '@angular/forms';
import { QuestionsService } from '../questions/questions.service';
import { Question } from '../questions/question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {CodeModel} from "@ngstack/code-editor";

@Component({
  selector: 'code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: [ './code-editor.component.css' ]
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  private executeListenerSubs: Subscription;
  executeResponse: ExecuteResponse;
  currentOutput: string;
  userCode: string;
  testCode : string;
  lang: string = "java";
  questionId;
  questionToSolve: Question;
  theme = 'vs-dark';
  them2 = 'vs-dark';
  solutionTemplate : string;
  solutionCodeModel: CodeModel;
  testCodeModel : CodeModel;
  testTemplate : string;
  options = {
    contextmenu: false,
    minimap: {
      enabled: false,
    },
  };
  options2 = {
    contextmenu: false,
    minimap: {
      enabled: false,
    },
  };

  constructor(private route: ActivatedRoute, private questionsService: QuestionsService, private codeService: CodeService) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('questionId')) {
        this.questionId = paramMap.get('questionId');

        this.questionsService.getQuestion(this.questionId).subscribe(questionData => {
          this.questionToSolve = {
            id: questionData._id,
            title: questionData.title,
            content: questionData.content,
            solutionTemplate: questionData.solutionTemplate,
            solution: questionData.solution,
            tests: questionData.tests,
            hints: questionData.hints,
            level: questionData.level,
            creator: questionData.creator
          };
          this.solutionTemplate = this.questionToSolve.solutionTemplate[0];
          this.solutionCodeModel = {
            language: 'java',
            uri: 'main.json',
            value: this.solutionTemplate,
          };

          this.testTemplate =  this.questionToSolve.tests ? this.questionToSolve.tests[0] : null;
          this.testCodeModel = {
            language: 'java',
            uri: 'main.json',
            value: this.testTemplate,
          };
        });
      }
     });

    this.executeResponse = { message: "", output: "", errors: "" };
    this.currentOutput = "";

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
    this.executeListenerSubs.unsubscribe();
  }

  onRunCode(code: string, tests: string) {
    this.codeService.runCode(this.lang, code, tests);
  }

  onCustomClick() {
    this.currentOutput = "Custom> " + this.executeResponse.message;
  }

  onRawOutputClick() {
    this.currentOutput = "Output> " + (this.executeResponse.errors === '' ? this.executeResponse.output : this.executeResponse.errors);
  }

  onCodeChanged(value , type: string) {
    if(type === 'solution') {
      this.userCode = value;
    }
    else{
      this.testCode = value;
    }
  }
}

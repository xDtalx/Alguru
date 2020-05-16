import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CodeService } from './code.service';
import { ExecuteResponse } from './execute-response.model';
import { NgModel } from '@angular/forms';
import { QuestionsService } from '../questions/questions.service';
import { Question } from '../questions/question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'ide',
  templateUrl: './ide.component.html',
  styleUrls: [ './ide.component.css' ]
})
export class IDEComponent implements OnInit, OnDestroy {
  private executeListenerSubs: Subscription;
  executeResponse: ExecuteResponse;
  currentOutput: string;
  solutionCode: string;
  testsCode: string;
  lang: string = 'java';
  questionId: string;
  questionToSolve: Question;
  theme: string = 'dark';
  solutionTemplate: string;
  code: string;
  solValue: string;
  testsValue: string;

  constructor(
    private route: ActivatedRoute, 
    private questionsService: QuestionsService, 
    private codeService: CodeService
  ) {}

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
          this.solValue = this.questionToSolve.solutionTemplate[0];
          this.testsValue = this.questionToSolve.tests[0];
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

  onValueChanged1(value) {
    console.log('editor1', value);
  }

  onValueChanged2(value) {
    console.log('editor2', value);
  }

  ngOnDestroy() {
    this.executeListenerSubs.unsubscribe();
  }

  onRunCode() {
    this.codeService.runCode(this.lang, this.solutionCode, this.testsCode);
  }

  onCustomClick() {
    this.currentOutput = "Custom> " + this.executeResponse.message;
  }

  onRawOuputClick() {
    this.currentOutput = "Output> " + (this.executeResponse.errors === '' ? this.executeResponse.output : this.executeResponse.errors);
  }

  onSolutionCodeChanged(value: string) {
    this.solutionCode = value;
  }

  onTestsCodeChanged(value: string) {
    this.testsCode = value;
  }
}

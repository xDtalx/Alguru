import { Component, OnInit, OnDestroy, ViewEncapsulation, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { CodeService } from './code.service';
import { ExecuteResponse } from './execute-response.model';
import { QuestionsService } from '../questions/questions.service';
import { Question } from '../questions/question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as $ from 'jquery';


@Component({
  selector: 'ide',
  templateUrl: './ide.component.html',
  styleUrls: [ './ide.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class IDEComponent implements OnInit, OnDestroy {
  private executeListenerSubs: Subscription;
  private setResizeEvent: boolean = false;
  public executeResponse: ExecuteResponse;
  public currentOutput: string;
  public solutionCode: string;
  public testsCode: string;
  public lang: string = 'java';
  public questionId: string;
  public questionToSolve: Question;
  public theme: string = 'dark';
  public solutionTemplate: string;
  public code: string;
  public solValue: string;
  public testsValue: string;
  public loading: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private questionsService: QuestionsService, 
    private codeService: CodeService,
    private renderer: Renderer2
  ) {
    $(document).ready(this.onPageLoaded.bind(this));
  }

  onPageLoaded(): void {
    $('.container').each((index, container) => {
      this.makeContainerWithFixHeight(container);
      $(window).resize(() => this.onWindowResize(container));
    });
  }

  makeContainerWithFixHeight(container): void {
    const style = getComputedStyle(container);

    setTimeout(() => {
      this.renderer.setStyle(container, 'max-height', style.height);
    }, 500);
  }

  onWindowResize(container): void {
    const style = getComputedStyle(container);

    this.renderer.setStyle(container, 'max-height', '100%');
    setTimeout(() => {
      this.renderer.setStyle(container, 'max-height', style.height);
    }, 500);
  }

  ngOnInit(): void {
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
      this.codeService.getExecuteResponseListener().subscribe(response => {
        this.executeResponse = response;
        this.loading = false;
        
        if(this.executeResponse !== null) {
          this.currentOutput = "Custom> " + this.executeResponse.message;
        }
      });
  }

  onSolutionChanged(value): void {
    this.solutionCode = value;
  }

  onTestsChanged(value): void {
    this.testsCode = value;
  }

  ngOnDestroy(): void {
    this.executeListenerSubs.unsubscribe();
  }

  onRunCode(): void {
    this.loading = true;
    this.codeService.runCode(this.lang, this.solutionCode, this.testsCode);
  }

  onCustomClick(): void {
    this.currentOutput = "Custom> " + this.executeResponse.message;
  }

  onRawOutputClick(): void {
    this.currentOutput = "Output> " + (this.executeResponse.errors === '' ? this.executeResponse.output : this.executeResponse.errors);
  }

  onSolutionCodeChanged(value: string): void {
    this.solutionCode = value;
  }

  onTestsCodeChanged(value: string): void {
    this.testsCode = value;
  }
}

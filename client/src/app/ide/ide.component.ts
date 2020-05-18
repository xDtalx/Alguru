import { Component, OnInit, OnDestroy, ViewEncapsulation, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { CodeService } from './code.service';
import { ExecuteResponse } from './execute-response.model';
import { QuestionsService } from '../questions/questions.service';
import { Question } from '../questions/question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as $ from 'jquery';
import { max } from 'rxjs/operators';


@Component({
  selector: 'ide',
  templateUrl: './ide.component.html',
  styleUrls: [ './ide.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class IDEComponent implements OnInit, OnDestroy {
  private executeListenerSubs: Subscription;
  private setResizeEvent: boolean = false;
  private prevHeight: number = 0;
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
      const style = getComputedStyle(container);
      this.makeContainerWithFixHeight(container, style);
      $(window).resize(() => this.refreshContainerSize(container, style));
    });
  }

  makeContainerWithFixHeight(container, style): void {
    setTimeout(() => {
      if(!$(container).hasClass('static-size')) {
        this.renderer.setStyle(container, 'max-height', style.height);
      }
    }, 500);
  }

  calcVH(v) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (v * h) / 100;
  }
  
  calcVW(v) {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (v * w) / 100;
  }
  

  refreshContainerSize(container, style): void {
    if(!$(container).hasClass('static-size')) {
      this.renderer.setStyle(container, 'max-height', '100%');
      
      if($(container).is('#solution-container')) {
        this.setContainerStartingHeight(container, 50);
      } else if($(container).is('#tests-container')) {
        this.setContainerStartingHeight(container, 30);
      }

      setTimeout(() => {
        this.renderer.setStyle(container, 'max-height', style.height);
      }, 500);
    }
  }

  setContainerStartingHeight(container, vh) {
    const fitContentHeight = this.calcSolutionContainerHeight(container);
    const startingHeight = this.calcVH(vh);
    const currentHeight = this.calcVH(100);
    let newMinHeight;

    if(currentHeight > this.prevHeight) {
      newMinHeight = Math.max(startingHeight, fitContentHeight);
    } else {
      newMinHeight = startingHeight < fitContentHeight ? fitContentHeight : Math.max(startingHeight, fitContentHeight);
    }

    this.renderer.setStyle(container, 'min-height', `${newMinHeight}px`);
    this.prevHeight = currentHeight;
  }

  calcSolutionContainerHeight(element): number {
    let height = 0;

    height += $(element).find('.head').outerHeight();
    height += $(element).find('.editor').outerHeight();

    return height;
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

  refreshAllContainersSize() {
    $('.container').each((index, container) => {
      const style = getComputedStyle(container);
      this.refreshContainerSize(container, style);
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

    if(!this.testsCode || this.testsCode.trim() === '') {
      this.testsCode = this.questionToSolve.tests[0];
    }

    if(!this.solutionCode || this.solutionCode.trim() === '') {
      this.solutionCode = this.questionToSolve.solutionTemplate[0];
    }

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

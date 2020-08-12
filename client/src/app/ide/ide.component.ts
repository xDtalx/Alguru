import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { Question } from '../questions/question.model';
import { QuestionsService } from '../questions/questions.service';
import { ThemeService } from '../theme/theme.service';
import { CodeService } from './code.service';
import { ExecuteResponse } from './execute-response.model';

@Component({
  selector: 'app-ide',
  styleUrls: ['./ide.component.css'],
  templateUrl: './ide.component.html'
})
export class IDEComponent implements OnInit, OnDestroy {
  private executeListenerSubs: Subscription;
  private time: number;
  private stopwatchInterval;
  public timeStr = '00:00:00';
  public executeResponse: ExecuteResponse;
  public currentOutput: string;
  public solutionCode: string;
  public testsCode: string;
  public lang = 'java';
  public questionId: string;
  public questionToSolve: Question;
  public theme = 'dark';
  public solutionTemplate: string;
  public code: string;
  public testsValue: string;
  public loading = false;
  public showHint = false;

  constructor(
    private route: ActivatedRoute,
    private questionsService: QuestionsService,
    private codeService: CodeService,
    private renderer: Renderer2,
    private themeService: ThemeService
  ) {
    $(document).ready(this.onPageLoaded.bind(this));
  }

  public ngOnInit(): void {
    this.themeService.setDarkTheme();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('questionId')) {
        this.questionId = paramMap.get('questionId');
        this.getQuestion();
      }
    });

    this.currentOutput = '';
    this.executeListenerSubs = this.codeService.getExecuteResponseListener().subscribe((response) => {
      this.executeResponse = response;
      this.loading = false;

      if (this.executeResponse) {
        this.currentOutput = 'Custom> ' + this.executeResponse.message;

        if (this.executeResponse.errors === '') {
          clearInterval(this.stopwatchInterval);
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.themeService.reset();
    this.executeListenerSubs.unsubscribe();
  }

  public onPageLoaded(): void {
    $('.container').each((index, container) => {
      const style: CSSStyleDeclaration = getComputedStyle(container);
      this.makeContainerWithFixHeight(container, style);
    });
  }

  public makeContainerWithFixHeight(container: HTMLElement, style: CSSStyleDeclaration): void {
    setTimeout(() => {
      if (!$(container).hasClass('static-size')) {
        const editor: HTMLElement = $(container).find('nt-editor')[0];
        const editorStyle: CSSStyleDeclaration = getComputedStyle(editor);

        this.renderer.setStyle(container, 'height', style.height);
        this.renderer.setStyle(editor, 'height', editorStyle.height);
      }
    }, 500);
  }

  public onSolutionChanged(value): void {
    this.solutionCode = value;
  }

  public onTestsChanged(value): void {
    this.testsCode = value;
  }

  public onRunCode(): void {
    if (this.executeResponse && this.executeResponse.errors === '') {
      this.resetQuestion();
    } else {
      this.loading = true;

      if (!this.testsCode || this.testsCode.trim() === '') {
        this.testsCode = this.questionToSolve.tests[0];
      }

      if (!this.solutionCode || this.solutionCode.trim() === '') {
        this.solutionCode = this.questionToSolve.solutionTemplate[0];
      }

      this.codeService.runCode(this.lang, this.solutionCode, this.testsCode);
    }
  }

  public onCustomClick(): void {
    this.currentOutput = 'Custom> ';

    if (this.executeResponse) {
      this.currentOutput += this.executeResponse.message;
    }
  }

  public onRawOutputClick(): void {
    this.currentOutput = 'Output> ';

    if (this.executeResponse) {
      this.currentOutput +=
        this.executeResponse.errors === '' ? this.executeResponse.output : this.executeResponse.errors;
    }
  }

  public onSolutionCodeChanged(value: string): void {
    if (this.solutionCode !== value) {
      this.solutionCode = value;
    }
  }

  public onTestsCodeChanged(value: string): void {
    this.testsCode = value;
  }

  public getVotes(): number {
    return -1;
  }

  /*eslint-disable */
  public voteUp(): void {}

  public voteDown(): void {}
  /* eslint-enable */

  public setShowHint(show: boolean): void {
    this.showHint = show;
  }

  private getQuestion(): void {
    this.questionsService.getQuestion(this.questionId).subscribe((questionData) => {
      this.questionToSolve = {
        content: questionData.content,
        creator: questionData.creator,
        hints: questionData.hints,
        id: questionData._id,
        level: questionData.level,
        solution: questionData.solution,
        solutionTemplate: questionData.solutionTemplate,
        tests: questionData.tests,
        title: questionData.title
      };
      this.solutionCode = this.questionToSolve.solutionTemplate[0];
      this.testsValue = this.questionToSolve.tests[0];
    });
    this.initStopwatch();
  }

  private initStopwatch(): void {
    this.time = Date.now() / 1000;
    this.stopwatchInterval = setInterval(() => {
      const currentSeconds = Date.now() / 1000 - this.time;
      const seconds = Math.floor(currentSeconds % 60);
      const minutes = Math.floor(currentSeconds / 60);
      const hours = Math.floor(currentSeconds / 3600);
      const formatedSeconds = seconds > 9 ? `${seconds}` : `0${seconds}`;
      const formatedMinutes = minutes > 9 ? `${minutes}` : `0${minutes}`;
      const formatedHours = hours > 9 ? `${hours}` : `0${hours}`;

      this.timeStr = `${formatedHours}:${formatedMinutes}:${formatedSeconds}`;
    }, 1000);
  }

  private resetQuestion(): void {
    this.executeResponse = null;
    this.currentOutput = 'Custom> ';
    this.getQuestion();
  }
}

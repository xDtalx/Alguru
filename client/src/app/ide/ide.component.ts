import { Component, OnDestroy, OnInit, Renderer2, AfterViewChecked, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { IQuestion } from '../questions/question.model';
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
  private questionUpdatedSubs: Subscription;
  private time: number;
  private stopwatchInterval;
  private langs = ['Java', 'Javascript', 'C#', 'C++', 'C', 'Python'];
  private currentLang = 0;
  public timeStr = '00:00:00';
  public executeResponse: ExecuteResponse;
  public currentOutput: string;
  public solutionCode: string;
  public testsCode: string;
  public questionId: string;
  public questionToSolve: IQuestion;
  public theme = 'dark';
  public solutionTemplate: string;
  public code: string;
  public loading = false;
  public showHint = false;
  public votes = 0;
  public messageDefaultValue: string;
  public hidePopUp = true;
  public voteType: string;
  public questionLangs: string[];

  constructor(
    private route: ActivatedRoute,
    private questionsService: QuestionsService,
    private codeService: CodeService,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private authService: AuthService
  ) {
    $(document).ready(this.onPageLoaded.bind(this));
    this.questionUpdatedSubs = this.questionsService.getQuestionUpdatedListener().subscribe((question: IQuestion) => {
      this.questionToSolve = question;
      this.solutionCode = this.questionToSolve.solutionTemplate[this.currentLang];
      this.testsCode = this.questionToSolve.tests[this.currentLang];
      this.updateVotes();
      this.updateLangsOptions();
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('questionId')) {
        this.questionId = paramMap.get('questionId');
        this.getQuestion();
      }
    });
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

  public ngOnInit(): void {
    this.themeService.setDarkTheme();
    this.currentOutput = '';
  }

  public ngOnDestroy(): void {
    this.themeService.reset();
    this.questionUpdatedSubs.unsubscribe();
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
    if (this.solutionCode !== value) {
      this.solutionCode = value;
    }
  }

  public onTestsChanged(value): void {
    if (this.testsCode !== value) {
      this.testsCode = value;
    }
  }

  public onRunCode(): void {
    this.loading = true;

    if (!this.testsCode || this.testsCode.trim() === '') {
      this.testsCode = this.questionToSolve.tests[this.currentLang];
    }

    if (!this.solutionCode || this.solutionCode.trim() === '') {
      this.solutionCode = this.questionToSolve.solutionTemplate[this.currentLang];
    }

    this.codeService.runCode(this.questionToSolve.id, this.langs[this.currentLang], this.solutionCode, this.testsCode);
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

  public updateVotes(): void {
    this.votes = 0;

    this.questionToSolve.votes.forEach((vote) => {
      if (vote.isUp) {
        this.votes++;
      } else {
        this.votes--;
      }
    });
  }

  public voteUp(): void {
    this.hidePopUp = false;
    this.voteType = 'up';
  }

  public voteDown(): void {
    this.hidePopUp = false;
    this.voteType = 'down';
  }

  public setShowHint(show: boolean): void {
    this.showHint = show;
  }

  private getQuestion(): void {
    this.questionsService.getQuestion(this.questionId);
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

  public getEditorConfig(): AngularEditorConfig {
    return editorConfig;
  }

  public onSubmitMessage(message: string): void {
    this.questionsService.vote(
      this.questionToSolve.id,
      this.authService.getUsername(),
      this.voteType === 'up',
      message
    );
    this.hidePopUp = true;
  }

  public hideVoteMessagePopup(): void {
    this.hidePopUp = true;
    this.voteType = null;
  }

  public setLang(lang: string): void {
    for (let i = 0; i < this.langs.length; i++) {
      if (this.langs[i] === lang) {
        this.currentLang = i;
        break;
      }
    }

    this.solutionCode = this.questionToSolve.solutionTemplate[this.currentLang];
    this.testsCode = this.questionToSolve.tests[this.currentLang];
  }

  private updateLangsOptions(): void {
    const langsCount = this.questionToSolve.solutionTemplate.length;
    this.questionLangs = [];

    for (let i = 0; i < langsCount; i++) {
      this.questionLangs.push(this.langs[i]);
    }
  }

  public getCurrentLang(): string {
    return this.langs[this.currentLang];
  }
}

const editorConfig: AngularEditorConfig = {
  height: '15rem',
  editable: true,
  spellcheck: true,
  minHeight: '5rem',
  maxHeight: '50rem',
  width: 'auto',
  minWidth: '0',
  translate: 'no',
  enableToolbar: true,
  showToolbar: true,
  defaultParagraphSeparator: 'div',
  defaultFontName: 'Arial',
  toolbarHiddenButtons: [
    [
      'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'justifyFull',
      'indent',
      'outdent',
      'insertUnorderedList',
      'insertOrderedList',
      'fontName'
    ],
    ['backgroundColor', 'customClasses', 'insertVideo', 'insertHorizontalRule', 'removeFormat']
  ],
  customClasses: [
    {
      class: 'quote',
      name: 'quote'
    },
    {
      class: 'redText',
      name: 'redText'
    },
    {
      class: 'titleText',
      name: 'titleText',
      tag: 'h1'
    }
  ]
};

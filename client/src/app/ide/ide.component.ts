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
  public solValue: string;
  public testsValue: string;
  public loading = false;

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
          this.solValue = this.questionToSolve.solutionTemplate[0];
          this.testsValue = this.questionToSolve.tests[0];
        });
      }
    });

    this.executeResponse = { message: '', output: '', errors: '' };
    this.currentOutput = '';
    this.executeListenerSubs = this.codeService.getExecuteResponseListener().subscribe((response) => {
      this.executeResponse = response;
      this.loading = false;

      if (this.executeResponse !== null) {
        this.currentOutput = 'Custom> ' + this.executeResponse.message;
      }
    });
  }

  public ngOnDestroy(): void {
    this.executeListenerSubs.unsubscribe();
  }

  public onPageLoaded(): void {
    $('.container').each((index, container) => {
      const style: CSSStyleDeclaration = getComputedStyle(container);
      this.makeContainerWithFixHeight(container, style);
    });
  }

  // public onKeyDown(event: KeyboardEvent) {
  //   const editor: HTMLElement = event.target as HTMLElement;
  //   const lastLine: HTMLElement = $(editor).find('.view-line').last()[0];
  //   const sel: Selection = document.getSelection();
  //   const currentLine: HTMLElement = this.editorService.getSelectedElementParentLine(editor, sel);
  //   let editorContainer = editor;

  //   while (!$(editorContainer).hasClass('editor-container')) {
  //     editorContainer = editorContainer.parentElement;
  //   }

  //   if (currentLine && currentLine === lastLine) {
  //     editorContainer.scrollTop = lastLine.offsetTop;
  //   }
  // }

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
    this.loading = true;

    if (!this.testsCode || this.testsCode.trim() === '') {
      this.testsCode = this.questionToSolve.tests[0];
    }

    if (!this.solutionCode || this.solutionCode.trim() === '') {
      this.solutionCode = this.questionToSolve.solutionTemplate[0];
    }

    this.codeService.runCode(this.lang, this.solutionCode, this.testsCode);
  }

  public onCustomClick(): void {
    this.currentOutput = 'Custom> ' + this.executeResponse.message;
  }

  public onRawOutputClick(): void {
    this.currentOutput =
      'Output> ' + (this.executeResponse.errors === '' ? this.executeResponse.output : this.executeResponse.errors);
  }

  public onSolutionCodeChanged(value: string): void {
    this.solutionCode = value;
  }

  public onTestsCodeChanged(value: string): void {
    this.testsCode = value;
  }
}

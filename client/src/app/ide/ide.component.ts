import { Component, OnInit, OnDestroy, ViewEncapsulation, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { CodeService } from './code.service';
import { ExecuteResponse } from './execute-response.model';
import { QuestionsService } from '../questions/questions.service';
import { Question } from '../questions/question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as $ from 'jquery';
import { EditorService } from '../editor/editor.service';


@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: [ './ide.component.css' ]
})
export class IDEComponent implements OnInit, OnDestroy {
  private executeListenerSubs: Subscription;
  private prevHeight = 0;
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
    private editorService: EditorService
  ) {
    $(document).ready(this.onPageLoaded.bind(this));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('questionId')) {
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

    this.executeResponse = { message: '', output: '', errors: '' };
    this.currentOutput = '';
    this.executeListenerSubs =
      this.codeService.getExecuteResponseListener().subscribe(response => {
        this.executeResponse = response;
        this.loading = false;

        if (this.executeResponse !== null) {
          this.currentOutput = 'Custom> ' + this.executeResponse.message;
        }
      });
  }

  onPageLoaded(): void {
    $('.container').each((index, container) => {
      const style: CSSStyleDeclaration = getComputedStyle(container);
      this.makeContainerWithFixHeight(container, style);
    });
  }

  makeContainerWithFixHeight(container: HTMLElement, style: CSSStyleDeclaration): void {
    setTimeout(() => {
      if (!$(container).hasClass('static-size')) {
        const editor: HTMLElement = $(container).find('app-editor')[0];
        const editorStyle: CSSStyleDeclaration = getComputedStyle(editor);

        this.renderer.setStyle(container, 'height', style.height);
        this.renderer.setStyle(editor, 'height', editorStyle.height);
      }
    }, 500);
  }

  onKeyDown(event: KeyboardEvent) {
    const editor: HTMLElement = event.target as HTMLElement;
    const lastLine: HTMLElement = $(editor).find('.view-line').last()[0];
    const sel: Selection = document.getSelection();
    const currentLine: HTMLElement = this.editorService.getSelectedElementParentLine(editor, sel);
    let editorContainer = editor;

    while (!$(editorContainer).hasClass('editor-container')) {
      editorContainer = editorContainer.parentElement;
    }

    if (currentLine === lastLine) {
      editorContainer.scrollTop = lastLine.offsetTop;
    }
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

    if (!this.testsCode || this.testsCode.trim() === '') {
      this.testsCode = this.questionToSolve.tests[0];
    }

    if (!this.solutionCode || this.solutionCode.trim() === '') {
      this.solutionCode = this.questionToSolve.solutionTemplate[0];
    }

    this.codeService.runCode(this.lang, this.solutionCode, this.testsCode);
  }

  onCustomClick(): void {
    this.currentOutput = 'Custom> ' + this.executeResponse.message;
  }

  onRawOutputClick(): void {
    this.currentOutput = 'Output> ' + (this.executeResponse.errors === '' ? this.executeResponse.output : this.executeResponse.errors);
  }

  onSolutionCodeChanged(value: string): void {
    this.solutionCode = value;
  }

  onTestsCodeChanged(value: string): void {
    this.testsCode = value;
  }
}

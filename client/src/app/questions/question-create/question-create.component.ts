import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { IVote } from 'src/app/forum/vote.model';
import { ThemeService } from 'src/app/theme/theme.service';
import { IQuestion } from '../question.model';
import { QuestionsService } from '../questions.service';

@Component({
  selector: 'app-question-create',
  styleUrls: ['./question-create.component.css'],
  templateUrl: './question-create.component.html'
})
export class QuestionCreateComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('levelCheckbox') public lvlCheckboxes: QueryList<ElementRef>;
  @ViewChildren('solutionTabCheckboxes') public solutionTabCheckboxes: QueryList<ElementRef>;
  @ViewChildren('solutionTemplateTabCheckboxes') public solutionTemplateTabCheckboxes: QueryList<ElementRef>;
  @ViewChildren('testsTabCheckboxes') public testsTabCheckboxes: QueryList<ElementRef>;

  public question: IQuestion;
  public isLoading = false;
  public theme = 'dark';
  public solutionCurrentLang = 0;
  public solutionTemplateCurrentLang = 0;
  public testsCurrentLang = 0;
  public mode = 'Create';
  private questionId: string;
  private questionsUpdatedSubs: Subscription;
  private errorsSub: Subscription;
  private questionUpdatedSubs: Subscription;

  constructor(
    private questionService: QuestionsService,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private authService: AuthService
  ) {}

  public ngAfterViewInit(): void {
    this.themeService.overrideProperty('--main-display', 'block');
    this.themeService.overrideProperty('--main-padding', '1rem 1rem 0 1rem');
    this.themeService.overrideProperty('--main-background-color', 'rgb(53, 58, 66)');
    this.themeService.setActiveThemeByName(this.theme);
  }

  public ngOnDestroy(): void {
    this.themeService.reset();
    this.questionsUpdatedSubs.unsubscribe();
    this.errorsSub.unsubscribe();
    this.questionUpdatedSubs.unsubscribe();
  }

  public ngOnInit() {
    this.questionUpdatedSubs = this.questionService.getQuestionUpdatedListener().subscribe((question: IQuestion) => {
      this.question = question;
    });
    this.question = {
      content: '',
      creator: '',
      hints: '',
      id: null,
      level: 0,
      solution: ['', ''],
      solutionTemplate: ['', ''],
      tests: ['', ''],
      title: '',
      votes: new Map<string, IVote>()
    };

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('questionId')) {
        this.setEditMode(paramMap);
      } else {
        this.setCreateMode();
      }
    });

    this.questionsUpdatedSubs = this.questionService
      .getQuestionsUpdatedListener()
      .subscribe(() => (this.isLoading = false));

    this.errorsSub = this.authService.getAuthErrorListener().subscribe(() => (this.isLoading = false));
  }

  public uncheckOtherTabs(event: MouseEvent, inputType: string): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    let checkboxes;

    switch (inputType) {
      case 'solution':
        checkboxes = this.solutionTabCheckboxes;
        this.solutionCurrentLang = this.getLangIndex(target.classList[0]);
        break;
      case 'solutionTemplate':
        checkboxes = this.solutionTemplateTabCheckboxes;
        this.solutionTemplateCurrentLang = this.getLangIndex(target.classList[0]);
        break;
      case 'tests':
        checkboxes = this.testsTabCheckboxes;
        this.testsCurrentLang = this.getLangIndex(target.classList[0]);
        break;
    }

    checkboxes.forEach((checkbox) => {
      if (target.classList[0] !== checkbox.nativeElement.classList[0]) {
        checkbox.nativeElement.checked = false;
      }
    });

    if (!target.checked) {
      target.checked = true;
    }
  }

  private getLangIndex(lang: string): number {
    let num;

    switch (lang) {
      case 'java':
        num = 0;
        break;
      case 'javascript':
        num = 1;
        break;
    }

    return num;
  }

  public uncheckOther(event: MouseEvent): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;

    this.lvlCheckboxes.forEach((checkbox) => {
      if (target.id !== checkbox.nativeElement.id) {
        checkbox.nativeElement.checked = false;
      }
    });

    switch (target.id) {
      case 'easy-checkbox':
        this.setLevel(0);
        break;
      case 'medium-checkbox':
        this.setLevel(1);
        break;
      case 'hard-checkbox':
        this.setLevel(2);
        break;
    }

    if (!target.checked) {
      target.checked = true;
    }
  }

  public setEditMode(paramMap) {
    this.mode = 'Update';
    this.questionId = paramMap.get('questionId');
    this.questionService.getQuestion(this.questionId);
  }

  public setCreateMode() {
    this.mode = 'Create';
    this.questionId = null;
  }

  public onSaveQuestion() {
    this.isLoading = true;

    if (this.mode === 'Create') {
      this.questionService.addQuestion(this.question);
    } else {
      this.questionService.updateQuestion(this.questionId, this.question);
    }
  }

  public onSolTemplateValueChanged(value) {
    this.question.solutionTemplate[this.solutionTemplateCurrentLang] = value;
  }

  public onTestsValueChanged(value) {
    this.question.tests[this.testsCurrentLang] = value;
  }

  public onSolValueChanged(value) {
    this.question.solution[this.solutionCurrentLang] = value;
  }

  public onContentValueChanged(value) {
    this.question.content = value;
  }

  public onTitleValueChanged(value) {
    this.question.title = value;
  }

  public onHintsValueChanged(value) {
    this.question.hints = value;
  }

  public setLevel(level: number) {
    this.question.level = level;
  }
}

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
  @ViewChildren('checkbox') public checkboxes: QueryList<ElementRef>;

  public retrievedQuestionData: IQuestion;
  public newQuestionData: IQuestion;
  public isLoading = false;
  public theme = 'dark';
  private mode = 'create';
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
      this.retrievedQuestionData = question;
    });
    this.newQuestionData = {
      content: null,
      creator: null,
      hints: null,
      id: null,
      level: null,
      solution: [],
      solutionTemplate: [],
      tests: [],
      title: null,
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

  public uncheckOther(event: MouseEvent) {
    const target: HTMLInputElement = event.target as HTMLInputElement;

    this.checkboxes.forEach((checkbox) => {
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
  }

  public setEditMode(paramMap) {
    this.mode = 'edit';
    this.questionId = paramMap.get('questionId');
    this.questionService.getQuestion(this.questionId);
  }

  public setCreateMode() {
    this.mode = 'create';
    this.questionId = null;
  }

  public onSaveQuestion() {
    this.isLoading = true;

    if (this.mode === 'create') {
      this.questionService.addQuestion(this.newQuestionData);
    } else {
      this.fillNotUpdatedFieldsWithOldValues(this.newQuestionData);
      this.questionService.updateQuestion(this.questionId, this.newQuestionData);
    }
  }

  public fillNotUpdatedFieldsWithOldValues(question) {
    Object.keys(question).forEach((value) => {
      if (!question[value] || (Array.isArray(question[value]) && !question[value][0])) {
        question[value] = this.retrievedQuestionData[value];
      }
    });
  }

  public onSolTemplateValueChanged(value) {
    this.newQuestionData.solutionTemplate[0] = value;
  }

  public onTestsValueChanged(value) {
    this.newQuestionData.tests[0] = value;
  }

  public onSolValueChanged(value) {
    this.newQuestionData.solution[0] = value;
  }

  public onContentValueChanged(value) {
    this.newQuestionData.content = value;
  }

  public onTitleValueChanged(value) {
    this.newQuestionData.title = value;
  }

  public onHintsValueChanged(value) {
    this.newQuestionData.hints = value;
  }

  public setLevel(level: number) {
    this.newQuestionData.level = level;
  }
}

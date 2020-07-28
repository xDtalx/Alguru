import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ThemeService } from 'src/app/theme/theme.service';
import { Question } from '../question.model';
import { QuestionsService } from '../questions.service';

@Component({
  selector: 'app-question-create',
  styleUrls: ['./question-create.component.css'],
  templateUrl: './question-create.component.html'
})
export class QuestionCreateComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('checkbox') public checkboxes: QueryList<ElementRef>;

  public retrievedQuestionData: Question;
  public newQuestionData: Question;
  public isLoading = false;
  public theme = 'dark';
  private mode = 'create';
  private questionId: string;

  constructor(
    private questionService: QuestionsService,
    private route: ActivatedRoute,
    private themeService: ThemeService
  ) {}

  public ngAfterViewInit(): void {
    this.themeService.overrideProperty('--main-display', 'block');
    this.themeService.overrideProperty('--main-padding', '1rem 1rem 0 1rem');
    this.themeService.overrideProperty('--main-background-color', 'rgb(53, 58, 66)');
    this.themeService.setActiveThemeByName(this.theme);
  }

  public ngOnDestroy(): void {
    this.themeService.reset();
  }

  public ngOnInit() {
    this.newQuestionData = {
      id: null,
      title: null,
      content: null,
      solution: [],
      solutionTemplate: [],
      tests: [],
      creator: null,
      hints: null,
      level: null
    };

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('questionId')) {
        this.setEditMode(paramMap);
      } else {
        this.setCreateMode();
      }
    });
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
    this.questionService.getQuestion(this.questionId).subscribe(this.setQuestion.bind(this));
  }

  public setQuestion(questionData) {
    this.retrievedQuestionData = {
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

import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { QuestionsService } from '../questions.service';
import { Question } from '../question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ThemeService } from 'src/app/editor/theme/theme.service';

@Component({
  selector: 'app-question-create',
  templateUrl: './question-create.component.html',
  styleUrls: ['./question-create.component.css']
})
export class QuestionCreateComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('checkbox') checkboxes: QueryList<ElementRef>;

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

  ngAfterViewInit(): void {
    this.themeService.overrideProperty('--main-display', 'block');
    this.themeService.overrideProperty('--main-padding', '1rem 1rem 0 1rem');
    this.themeService.overrideProperty('--main-background-color', 'rgb(53, 58, 66)');
    this.themeService.setActiveThemeByName(this.theme);
  }

  ngOnDestroy(): void {
    this.themeService.reset();
  }

  ngOnInit() {
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

  uncheckOther(event: MouseEvent) {
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

  setEditMode(paramMap) {
    this.mode = 'edit';
    this.questionId = paramMap.get('questionId');
    this.questionService.getQuestion(this.questionId).subscribe(this.setQuestion.bind(this));
  }

  setQuestion(questionData) {
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

  setCreateMode() {
    this.mode = 'create';
    this.questionId = null;
  }

  onSaveQuestion() {
    this.isLoading = true;

    if (this.mode === 'create') {
      this.questionService.addQuestion(this.newQuestionData);
    } else {
      this.fillNotUpdatedFieldsWithOldValues(this.newQuestionData);
      this.questionService.updateQuestion(this.questionId, this.newQuestionData);
    }
  }

  fillNotUpdatedFieldsWithOldValues(question) {
    Object.keys(question).forEach((value) => {
      if (!question[value] || (Array.isArray(question[value]) && !question[value][0])) {
        question[value] = this.retrievedQuestionData[value];
      }
    });
  }

  onSolTemplateValueChanged(value) {
    this.newQuestionData.solutionTemplate[0] = value;
  }

  onTestsValueChanged(value) {
    this.newQuestionData.tests[0] = value;
  }

  onSolValueChanged(value) {
    this.newQuestionData.solution[0] = value;
  }

  onContentValueChanged(value) {
    this.newQuestionData.content = value;
  }

  onTitleValueChanged(value) {
    this.newQuestionData.title = value;
  }

  onHintsValueChanged(value) {
    this.newQuestionData.hints = value;
  }

  setLevel(level: number) {
    this.newQuestionData.level = level;
  }
}

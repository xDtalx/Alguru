import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { QuestionsService } from '../questions.service';
import { Question } from '../question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-question-create',
  templateUrl: './question-create.component.html',
  styleUrls: [ './question-create.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class QuestionCreateComponent implements OnInit {

  public retrievedQuestionData: Question;
  public newQuestionData: Question;
  public isLoading: boolean = false;
  private mode ='create';
  private questionId: string;

  constructor(private questionService: QuestionsService, private route: ActivatedRoute) {}

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
    }
    
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
        if(paramMap.has('questionId')) {
          this.setEditMode(paramMap);
        } else {
          this.setCreateMode();
        }
    });
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
    }
  }

  setCreateMode() {
    this.mode = 'create';
    this.questionId = null;
  }

  onSaveQuestion() {
    this.isLoading = true;

    if(this.mode ==='create') {
      this.questionService.addQuestion(this.newQuestionData);
    } else {
      this.fillNotUpdatedFieldsWithOldValues(this.newQuestionData);
      this.questionService.updateQuestion(this.questionId, this.newQuestionData);
    }
  }

  fillNotUpdatedFieldsWithOldValues(question) {
    Object.keys(question).forEach(value => {
      if(!question[value] || (Array.isArray(question[value]) && !question[value][0])) {
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

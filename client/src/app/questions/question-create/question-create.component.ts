import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QuestionsService } from '../questions.service';
import { Question } from '../question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { QuestionListComponent } from '../question-list/question-list.component';

@Component({
  selector: 'app-question-create',
  templateUrl: './question-create.component.html',
  styleUrls: [ './question-create.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class QuestionCreateComponent implements OnInit {

  public question: Question;
  public isLoading: boolean = false;
  private level: number;
  private mode ='create';
  private questionId: string;
  public solTemplate: string;
  public title: string;
  public content: string;
  public solution: string;
  public tests: string;
  public hints: string;


  constructor(private questionService: QuestionsService, private route: ActivatedRoute) {}

  ngOnInit() {
   this.route.paramMap.subscribe((paramMap: ParamMap) => {
    if(paramMap.has('questionId')) {
      this.mode = 'edit';
      this.questionId = paramMap.get('questionId');

      this.questionService.getQuestion(this.questionId).subscribe(questionData => {
        this.question = {
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
      });
    } else {
      this.mode = 'create';
      this.questionId = null;
    }
   });
  }

  onSaveQuestion() {
    this.isLoading = true;

    const question: Question = {
      id: null,
      title: this.title,
      content: this.content,
      solutionTemplate: [ this.solTemplate ],
      solution: [ this.solution ],
      tests: [ this.tests ],
      hints: this.hints,
      level: this.level,
      creator: null
    }

    console.log(question);

    if(this.mode ==='create') {
      this.questionService.addQuestion(question);
    } else {
      this.questionService.updateQuestion(this.questionId, question);
    }
  }

  onSolTemplateValueChanged(value) {
    this.solTemplate = value;
  }

  onTestsValueChanged(value) {
    this.tests = value;
  }

  onSolValueChanged(value) {
    this.solution = value;
  }

  onContentValueChanged(value) {
    this.content = value;
  }

  onTitleValueChanged(value) {
    this.title = value;
  }

  onHintsValueChanged(value) {
    this.hints = value;
  }

  setLevel(level: number) {
    this.level = level;
  }
}

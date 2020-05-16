import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QuestionsService } from '../questions.service';
import { Question } from '../question.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { QuestionListComponent } from '../question-list/question-list.component';

@Component({
  selector: 'app-question-create',
  templateUrl: './question-create.component.html',
  styleUrls: [ './question-create.component.css' ]
})
export class QuestionCreateComponent implements OnInit {

  public question: Question;
  public isLoading: boolean = false;
  private level: number;
  private mode ='create';
  private questionId: string;
  public solTemplate: string;

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

  onSaveQuestion(form: NgForm) {
    this.isLoading = true;

    const question: Question = {
      id: null,
      title: form.value.title,
      content: form.value.content,
      solutionTemplate: [ form.value.solutionTemplate ],
      solution: [ form.value.solution ],
      tests: [ form.value.tests ],
      hints: form.value.hints,
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

  setLevel(level: number) {
    this.level = level;
  }
}

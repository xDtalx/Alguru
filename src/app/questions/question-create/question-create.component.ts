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
          solution: questionData.solution,
          hints: questionData.hints,
          level: questionData.level
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
      solution: form.value.solution,
      hints: form.value.hints,
      level: this.level
    }

    if(this.mode ==='create') {
      this.questionService.addQuestion(question);
    } else {
      this.questionService.updateQuestion(this.questionId, question);
    }
  }

  setLevel(level: number) {
    this.level = level;
    console.log('level: ' + level);
  }
}

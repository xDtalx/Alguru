import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QuestionsService } from '../questions.service';
import { Question } from '../question.model';

@Component({
  selector: 'app-question-create',
  templateUrl: './question-create.component.html',
  styleUrls: [ './question-create.component.css' ]
})
export class QuestionCreateComponent {
  title: string;
  content: string;
  hints: string;
  Solution: string;
  level: number;

  constructor(private questionService: QuestionsService)
  {
  }

  onAddQuestion(form: NgForm)
  {
    const question: Question = {
      id: null,
      title: form.value.title,
      content: form.value.content,
      solution: form.value.solution,
      hints: form.value.hints,
      level: this.level
    }

    this.questionService.addQuestion(question);
  }

  setLevel(level: number)
  {
    this.level = level;
    console.log('level: ' + level);
  }
}

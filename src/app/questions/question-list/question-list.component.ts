import { Component, OnInit, OnDestroy } from '@angular/core';
import { Question } from '../question.model';
import { QuestionsService } from '../questions.service';
import {Subscription} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: [ './question-list.component.css' ]
})
export class QuestionListComponent implements OnInit, OnDestroy {
  // used in order to unsubscribe from the service when the page, which the list in, not shown
  private questionsSub: Subscription;
  questions: Question[] = [];
  isUserAuth: boolean;

  constructor(private questionService: QuestionsService, private authService: AuthService){}

  ngOnInit() {
    this.authService
    .getAuthStatusListener()
    .subscribe(isAuth => {
      this.isUserAuth = isAuth;
    });

    this.isUserAuth = this.authService.getIsAuth();
    this.questionService.getQuestions();
    this.questionsSub = this.questionService.getQuestionUpdatedListener()
      .subscribe((questions: Question[]) => {
        this.questions = questions;
      });
  }

  ngOnDestroy() {
    this.questionsSub.unsubscribe();
  }

  onDelete(questionId: string) {
    this.questionService.deleteQuestion(questionId);
  }

  onEdit(questionId: string) {
  }
}

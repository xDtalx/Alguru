import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Question } from '../question.model';
import { QuestionsService } from '../questions.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
})
export class QuestionListComponent implements OnInit, OnDestroy {
  // used in order to unsubscribe from the service when the page, which the list in, not shown
  private questionsSub: Subscription;
  questions: Question[] = [];
  isUserAuth: boolean;
  isAdmin : boolean;
  userId: string;
  displayedColumns: string[] = ['title', 'level', 'actions'];
  dataSource: MatTableDataSource<Question>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private questionService: QuestionsService, private authService: AuthService) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.isUserAuth = this.authService.getIsAuth();
    this.questionService.getQuestions();
    this.questionsSub = this.questionService.getQuestionUpdatedListener().subscribe((questions: Question[]) => {
      this.questions = questions;
      this.dataSource = new MatTableDataSource(questions);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
    this.authService.getAuthStatusListener().subscribe((isAuth) => {
      this.isUserAuth = isAuth;
      this.userId = this.authService.getUserId();
    });
    this.dataSource = new MatTableDataSource(this.questions);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.isAdmin = this.authService.getIsAdmin();
  }

  ngOnDestroy() {
    this.questionsSub.unsubscribe();
  }

  onDelete(questionId: string) {
    this.questionService.deleteQuestion(questionId);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

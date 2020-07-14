import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Question } from '../question.model';
import { QuestionsService } from '../questions.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ThemeService } from 'src/app/editor/theme/theme.service';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css']
})
export class QuestionListComponent implements OnInit, OnDestroy {
  // used in order to unsubscribe from the service when the page, which the list in, not shown
  public questions: Question[] = [];
  public isUserAuth: boolean;
  public isAdmin: boolean;
  public userId: string;
  public displayedColumns: string[] = ['title', 'level', 'actions'];
  public dataSource: MatTableDataSource<Question>;
  private questionsSub: Subscription;
  private theme = 'dark';

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private questionService: QuestionsService,
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.overrideProperty('--main-display', 'block');
    this.themeService.setActiveThemeByName(this.theme);

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
    this.themeService.reset();
    this.questionsSub.unsubscribe();
  }

  onDelete(questionId: string) {
    this.questionService.deleteQuestion(questionId);
  }

  getLevelNumber(level: string) {
    let levelNumber = -1;

    if ('easy'.startsWith(level)) {
      levelNumber = 0;
    } else if ('medium'.startsWith(level)) {
      levelNumber = 1;
    } else if ('hard'.startsWith(level)) {
      levelNumber = 2;
    }

    return levelNumber;
  }

  applyFilter(event: Event) {
    this.dataSource.filterPredicate = (data: Question, filter: string) => this.getLevelNumber(filter) === data.level;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

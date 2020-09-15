import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { IVote } from 'src/app/forum/vote.model';
import { ProfileService } from 'src/app/profile/profile.service';
import { ThemeService } from 'src/app/theme/theme.service';
import { IQuestion } from '../question.model';
import { QuestionsService } from '../questions.service';

@Component({
  selector: 'app-question-list',
  styleUrls: ['./question-list.component.css'],
  templateUrl: './question-list.component.html'
})
export class QuestionListComponent implements OnInit, OnDestroy {
  // used in order to unsubscribe from the service when the page, which the list in, not shown
  public questions: IQuestion[] = [];
  public isUserAuth: boolean;
  public isAdmin: boolean;
  public verified: boolean;
  public emailSent: boolean;
  public solvedQuestions: Map<string, boolean>;
  public username: string;
  public displayedColumns: string[] = ['title', 'level', 'votes', 'author', 'actions'];
  public dataSource: MatTableDataSource<IQuestion>;
  private questionsSub: Subscription;
  private theme = 'dark';

  @ViewChild(MatPaginator, { static: true }) public paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) public sort: MatSort;

  constructor(
    private questionService: QuestionsService,
    private authService: AuthService,
    private themeService: ThemeService,
    private profileService: ProfileService
  ) {}

  public ngOnInit() {
    this.themeService.overrideProperty('--main-display', 'block');
    this.themeService.setActiveThemeByName(this.theme);
    this.username = this.authService.getUsername();
    this.isUserAuth = this.authService.getIsAuth();
    this.verified = this.authService.isVerified();
    this.questionService.getQuestions();
    this.questionsSub = this.questionService.getQuestionsUpdatedListener().subscribe((questions: IQuestion[]) => {
      this.questions = questions;
      this.dataSource = new MatTableDataSource(questions);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (data, attribute) => {
        if (attribute === 'votes') {
          return this.getQuestionVotesCount(data);
        }

        return data[attribute];
      };
    });
    this.authService.getAuthStatusListener().subscribe((isAuth) => {
      this.isUserAuth = isAuth;
      this.username = this.authService.getUsername();
    });
    this.isAdmin = this.authService.getIsAdmin();
    this.profileService.getStatsUpdatedListener().subscribe((stats) => (this.solvedQuestions = stats.solvedQuestions));
    this.profileService.updateSolvedQuestions();
  }

  public ngOnDestroy() {
    this.themeService.reset();
    this.questionsSub.unsubscribe();
  }

  public onDelete(questionId: string) {
    this.questionService.deleteQuestion(questionId);
  }

  public getLevelNumber(level: string) {
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

  public resendVarificationEmail(): void {
    this.authService.resendVarificationEmail();
    this.emailSent = true;
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public getQuestionVotesCount(question: IQuestion): string {
    let votes = 0;

    question.votes.forEach((vote: IVote) => {
      if (vote.isUp) {
        votes++;
      } else {
        votes--;
      }
    });

    return String(votes);
  }
}

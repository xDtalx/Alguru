import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Question } from './question.model';

const BACKEND_URL = environment.apiUrl + '/questions';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private questions: Question[] = [];
  private questionsUpdated = new Subject<Question[]>();

  constructor(private http: HttpClient, private router: Router) {}

  public getQuestions() {
    this.http
      .get<any>(BACKEND_URL)
      .pipe(
        map((questionsData) => {
          return questionsData.map((question) => {
            return {
              id: question._id,
              title: question.title,
              content: question.content,
              solution: question.solution,
              hints: question.hints,
              level: question.level,
              creator: question.creator
            };
          });
        })
      )
      .subscribe((transQuestions) => {
        this.questions = transQuestions;
        this.questionsUpdated.next([...this.questions]);
      });
  }

  public getQuestionUpdatedListener() {
    return this.questionsUpdated.asObservable();
  }

  public getQuestion(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      solutionTemplate: string[];
      solution: string[];
      tests: string[];
      hints: string;
      level: number;
      creator: string;
    }>(BACKEND_URL + '/' + id);
  }

  public createQuestion(
    title: string,
    content: string,
    solutionTemplate: string[],
    solution: string[],
    tests: string[],
    hints: string,
    level: number
  ) {
    const question: Question = {
      id: null,
      title,
      content,
      solutionTemplate,
      solution,
      tests,
      hints,
      level,
      creator: null
    };

    this.addQuestion(question);
  }

  public addQuestion(question: Question) {
    this.http.post<{ message: string; questionId: string }>(BACKEND_URL, question).subscribe((responseData) => {
      question.id = responseData.questionId;
      this.questions.push(question);
      this.questionsUpdated.next([...this.questions]);
    });
  }

  public deleteQuestion(id: string) {
    this.http.delete(BACKEND_URL + '/' + id).subscribe(() => {
      const updatedQuestions = this.questions.filter((question) => question.id !== id);
      this.questions = updatedQuestions;
      this.questionsUpdated.next([...this.questions]);
    });
  }

  public updateQuestion(id: string, question: Question) {
    const questionToUpdate: Question = {
      id,
      title: question.title,
      content: question.content,
      solutionTemplate: question.solutionTemplate,
      solution: question.solution,
      tests: question.tests,
      hints: question.hints,
      level: question.level,
      creator: null
    };

    this.http.put(BACKEND_URL + '/' + id, questionToUpdate).subscribe(() => {
      const oldQuestionIndex = this.questions.findIndex((q) => q.id === id);
      this.questions[oldQuestionIndex] = question;
      this.questionsUpdated.next([...this.questions]);
      this.router.navigate(['/']);
    });
  }
}

import { Question } from './question.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators'

// Uses Injection design pattern
@Injectable({ providedIn: 'root'})
export class QuestionsService
{
  private questions: Question[] = [];
  private questionsUpdated = new Subject<Question[]>();

  constructor(private http: HttpClient)
  {
  }

  getQuestions()
  {
    this.http
      .get<any>('http://localhost:3000/api/questions')
      .pipe(map(questionsData =>
        {
          return questionsData.map(question =>
            {
              return {
                id: question._id,
                title: question.title,
                content: question.content,
                solution: question.solution,
                hints: question.hints,
                level: question.level
              }
            });
        }))
      .subscribe(transQuestions =>
        {
          this.questions = transQuestions;
          this.questionsUpdated.next([...this.questions]);
        });
  }

  getQuestionUpdatedListener()
  {
    return this.questionsUpdated.asObservable();
  }

  createQuestion(title: string, content: string, solution: string, hints: string, level: number)
  {
    let question: Question =
    {
      id: null,
      title: title,
      content: content,
      solution: solution,
      hints: hints,
      level: level
    }

    this.addQuestion(question);
  }

  addQuestion(question: Question)
  {
    this.http.post<{ message: string, questionId: string }>('http://localhost:3000/api/questions', question)
      .subscribe(responseData =>
      {
        question.id = responseData.questionId;
        this.questions.push(question);
        this.questionsUpdated.next([...this.questions]);
        console.log(this.questions);
      });
  }

  deleteQuestion(id: string)
  {
    this.http.delete('http://localhost:3000/api/questions/' + id)
    .subscribe(() =>
    {
      const updatedQuestions = this.questions.filter(question => question.id !== id);
      this.questions = updatedQuestions;
      this.questionsUpdated.next([...this.questions]);
    });
  }
}

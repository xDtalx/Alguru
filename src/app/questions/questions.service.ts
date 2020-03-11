import { Question } from './question.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';


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
    this.http.get<Question[]>('https://localhost:3000/api/questions')
      .subscribe(questionsData =>
      {
        this.questions = questionsData;
        this.questionsUpdated.next([...this.questions]);
      });
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
    this.http.post<{message: string}>('http://localhost:3000/api/questions', question)
      .subscribe(() =>
      {
        this.questions.push(question);
        this.questionsUpdated.next([...this.questions]);
        console.log(this.questions);
      });
  }
}

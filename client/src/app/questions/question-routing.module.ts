import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IDEComponent } from '../ide/ide.component';
import { QuestionCreateComponent } from './question-create/question-create.component';
import { QuestionListComponent } from './question-list/question-list.component';

const routes = [
  {
    component: IDEComponent,
    data: { showSmallHeader: true },
    path: 'solve/:questionId'
  },
  {
    component: QuestionCreateComponent,
    data: { showSmallHeader: true },
    path: 'create'
  },
  {
    component: QuestionListComponent,
    data: { showSmallHeader: true },
    path: 'list'
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class QuestionRoutingModule {}

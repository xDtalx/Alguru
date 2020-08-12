import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmailVerificationGuard } from '../auth/email-verification/email-verification.guard';
import { IDEComponent } from '../ide/ide.component';
import { QuestionCreateComponent } from './question-create/question-create.component';
import { QuestionListComponent } from './question-list/question-list.component';

const routes = [
  {
    canActivate: [EmailVerificationGuard],
    component: IDEComponent,
    data: { showSmallHeader: true, navigateUrlOnLogout: '/' },
    path: 'solve/:questionId'
  },
  {
    canActivate: [EmailVerificationGuard],
    component: QuestionCreateComponent,
    data: { showSmallHeader: true, navigateUrlOnLogout: '/' },
    path: 'create'
  },
  {
    canActivate: [EmailVerificationGuard],
    component: QuestionCreateComponent,
    data: { showSmallHeader: true, navigateUrlOnLogout: '/' },
    path: 'edit/:questionId'
  },
  {
    component: QuestionListComponent,
    data: { showSmallHeader: true, navigateUrlOnLogout: '/' },
    path: 'list'
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [EmailVerificationGuard]
})
export class QuestionRoutingModule {}

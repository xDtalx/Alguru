import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { QuestionCreateComponent } from './questions/question-create/question-create.component';
import { LoginComponent } from './auth/login/login.component';
import { QuestionListComponent } from './questions/question-list/question-list.component';
import { AuthGuard } from './auth/auth.guard';
import { IDEComponent } from './ide/ide.component';
import { EditorComponent } from './editor/editor.component';
import { ForumComponent } from './forum/forum.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { showSmallHeader: false }
  },
  {
    path: 'code-editor',
    component: EditorComponent,
    data: { showSmallHeader: true },
    canActivate: [AuthGuard]
  },
  {
    path: 'questions-list',
    component: QuestionListComponent,
    data: { showSmallHeader: true },
    canActivate: [AuthGuard]
  },
  {
    path: 'solve/:questionId',
    component: IDEComponent,
    data: { showSmallHeader: true },
    canActivate: [AuthGuard]
  },
  {
    path: 'edit/:questionId',
    component: QuestionCreateComponent,
    data: { showSmallHeader: true },
    canActivate: [AuthGuard]
  },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'create-question',
    component: QuestionCreateComponent,
    data: { showSmallHeader: true },
    canActivate: [AuthGuard]
  },
  {
    path: 'forum',
    component: ForumComponent,
    data: { showSmallHeader: true },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from './auth/register/register.component';
import { QuestionCreateComponent } from './questions/question-create/question-create.component';
import { LoginComponent } from './auth/login/login.component';
import { QuestionListComponent } from './questions/question-list/question-list.component';
import { AuthGuard } from './auth/auth.guard';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { ReleaseGuard } from './release.guard';
import { IDEComponent } from './ide/ide.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { EditorComponent } from './editor/editor.component';

const routes: Routes = [
  { path: '', component: ComingSoonComponent, data: { showSmallHeader: false }},
  { path: '', canActivate: [ReleaseGuard], children: [
    { path: 'code-editor', component: EditorComponent, data: { showSmallHeader: true }, canActivate: [AuthGuard]},
    { path: '', component: QuestionListComponent, data: { showSmallHeader: true }},
    { path: 'questions-list', component: QuestionListComponent, data: { showSmallHeader: true }},
    { path: 'solve/:questionId', component: IDEComponent, data: { showSmallHeader: true }, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminPageComponent, data: { showSmallHeader: true }, canActivate: [AuthGuard] },
    { path: 'edit/:questionId', component: QuestionCreateComponent, data: { showSmallHeader: true }, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'create-question', component: QuestionCreateComponent, data: { showSmallHeader: true }, canActivate: [AuthGuard] }
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, ReleaseGuard]
})
export class AppRoutingModule { }

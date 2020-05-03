import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { QuestionCreateComponent } from './questions/question-create/question-create.component';
import { LoginComponent } from './auth/login/login.component';
import { QuestionListComponent } from './questions/question-list/question-list.component';
import { AuthGuard } from './auth/auth.guard';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { ReleaseGuard } from './release.guard';
import { CodeEditorComponent } from './code-editor/code-editor.component';

const routes: Routes = [
  { path: '', component: ComingSoonComponent},
  { path: '', canActivate: [ReleaseGuard], children: [
    { path: '', component: QuestionListComponent},
    { path: 'questions-list', component: QuestionListComponent},
    { path: 'solve/:questionId', component: CodeEditorComponent, canActivate: [AuthGuard] },
    { path: 'edit/:questionId', component: QuestionCreateComponent, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'create-question', component: QuestionCreateComponent, canActivate: [AuthGuard] }
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, ReleaseGuard]
})
export class AppRoutingModule { }

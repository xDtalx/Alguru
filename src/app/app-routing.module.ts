import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { QuestionCreateComponent } from './questions/question-create/question-create.component';
import { LoginComponent } from './auth/login/login.component';
import { QuestionListComponent } from './questions/question-list/question-list.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', component: QuestionListComponent },
  { path: 'edit/:questionId', component: QuestionCreateComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'create-question', component: QuestionCreateComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForumComponent } from './forum/forum.component';
import { HomeComponent } from './home/home.component';
import { IDEComponent } from './ide/ide.component';
import { ProfileComponent } from './profile/profile.component';
import { QuestionCreateComponent } from './questions/question-create/question-create.component';
import { QuestionListComponent } from './questions/question-list/question-list.component';

const routes: Routes = [
  {
    component: HomeComponent,
    data: { showSmallHeader: false },
    path: ''
  },
  {
    canActivate: [AuthGuard],
    component: QuestionListComponent,
    data: { showSmallHeader: true },
    path: 'questions-list'
  },
  {
    canActivate: [AuthGuard],
    component: ProfileComponent,
    data: { showSmallHeader: true },
    path: 'profile/:username'
  },
  {
    canActivate: [AuthGuard],
    component: IDEComponent,
    data: { showSmallHeader: true },
    path: 'solve/:questionId'
  },
  {
    canActivate: [AuthGuard],
    component: QuestionCreateComponent,
    data: { showSmallHeader: true },
    path: 'edit/:questionId'
  },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    canActivate: [AuthGuard],
    component: QuestionCreateComponent,
    data: { showSmallHeader: true },
    path: 'create-question'
  },
  {
    canActivate: [AuthGuard],
    component: ForumComponent,
    data: { showSmallHeader: true },
    path: 'forum'
  },
  {
    canActivate: [AuthGuard],
    component: ForumComponent,
    data: { showSmallHeader: true },
    path: 'forum/:postId'
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
  providers: [AuthGuard]
})
export class AppRoutingModule {}

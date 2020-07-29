import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    component: HomeComponent,
    data: { showSmallHeader: false },
    path: ''
  },
  {
    canActivate: [AuthGuard],
    loadChildren: () => import('./profile/profile.module').then((mod) => mod.ProfileModule),
    path: 'users'
  },
  {
    canActivate: [AuthGuard],
    loadChildren: () => import('./questions/questions.module').then((mod) => mod.QuestionsModule),
    path: 'questions'
  },
  {
    canActivate: [AuthGuard],
    loadChildren: () => import('./forum/forum.module').then((mod) => mod.ForumModule),
    path: 'forum'
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
  providers: [AuthGuard]
})
export class AppRoutingModule {}

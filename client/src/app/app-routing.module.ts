import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { EmailVerificationComponent } from './auth/email-verification/email-verification.component';
import { PasswordResetComponent } from './auth/password-reset/password-reset.component';
import { HomeComponent } from './home/home.component';
import { NotificationCenterComponent } from './notification-center/notification-center.component';

const routes: Routes = [
  {
    component: HomeComponent,
    data: { showSmallHeader: false },
    path: ''
  },
  {
    component: EmailVerificationComponent,
    data: { showSmallHeader: true, showSmallHeaderOnLogout: true },
    path: 'users/verify/:verifyToken'
  },
  {
    component: NotificationCenterComponent,
    data: { showSmallHeader: true, showSmallHeaderOnLogout: true },
    path: 'notifications'
  },
  {
    component: PasswordResetComponent,
    data: { showSmallHeader: true, showSmallHeaderOnLogout: true },
    path: 'users/login/reset/:resetToken'
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

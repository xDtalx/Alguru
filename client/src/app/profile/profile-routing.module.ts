import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './profile.component';

const routes = [
  {
    component: ProfileComponent,
    data: { showSmallHeader: true },
    path: 'profile/:username'
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class ProfileRoutingModule {}

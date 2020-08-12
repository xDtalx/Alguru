import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ForumComponent } from './forum.component';

const routes = [
  {
    component: ForumComponent,
    data: { showSmallHeader: true, showSmallHeaderOnLogout: true },
    path: ''
  },
  {
    component: ForumComponent,
    data: { showSmallHeader: true, showSmallHeaderOnLogout: true },
    path: 'post/:postId'
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class ForumRoutingModule {}

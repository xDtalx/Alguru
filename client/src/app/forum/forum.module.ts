import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ErrorSharedModule } from '../error/error-shared.module';
import { ForumRoutingModule } from './forum-routing.module';
import { ForumComponent } from './forum.component';

@NgModule({
  declarations: [ForumComponent],
  imports: [CommonModule, FormsModule, AngularEditorModule, ForumRoutingModule, ErrorSharedModule]
})
export class ForumModule {}

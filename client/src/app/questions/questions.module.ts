import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NeutrinoModule } from 'neutrino';
import { ErrorSharedModule } from '../error/error-shared.module';
import { IDEComponent } from '../ide/ide.component';
import { QuestionCreateComponent } from './question-create/question-create.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { QuestionRoutingModule } from './question-routing.module';

@NgModule({
  declarations: [IDEComponent, QuestionListComponent, QuestionCreateComponent],
  imports: [
    MatFormFieldModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatSidenavModule,
    QuestionRoutingModule,
    NeutrinoModule,
    FormsModule,
    CommonModule,
    AngularEditorModule,
    ErrorSharedModule,
    FontAwesomeModule
  ]
})
export class QuestionsModule {
  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIcons(faCheck);
  }
}

import { NgModule } from '@angular/core';
import { SharedModule } from '../04-shared-module/shared-module.module';

import { QryComponent } from './qry.component';
import { QueryOptionsComponent } from './query-options/query-options.component';
import { QryFormComponent } from './form/qry-form.component';
import { SharedConditionComponent } from './shared-condition/shared-condition.component';
import { SharedInputComponent } from './shared-condition/shared-input-field/shared-input.component';
import { SharedInputListComponent } from './shared-condition/shared-input-field-list/shared-input-list.component';
import { SharedInputBooleanComponent } from './shared-condition/shared-input-boolean/shared-input-boolean.component';
import { SharedInputDateComponent } from './shared-condition/shared-input-date/shared-input-date.component';
import { SharedInputDateListComponent } from './shared-condition/shared-input-date-list/shared-input-date-list.component';

import { CheckboxForBookQryComponent } from './checkbox-for-book-qry/checkbox-for-book-qry.component';
import { CheckboxForAuthorQryComponent } from './checkbox-for-author-qry/checkbox-for-author-qry.component';
import { CheckboxForReaderQryComponent } from './checkbox-for-reader-qry/checkbox-for-reader-qry.component';
import { CheckboxForBooksToReadersQryComponent } from './checkbox-for-books-to-readers-qry/checkbox-for-books-to-readers-qry.component';

import { SharedTableFactoryModule } from '../03-shared-table-factory-module/shared-table-factory.module';

import { SearchQryRoutingModule } from './qry-routing.module';

@NgModule({
  
  declarations: [
    QueryOptionsComponent,
    QryFormComponent,
    SharedConditionComponent,
    SharedInputComponent,
    SharedInputListComponent,
    SharedInputBooleanComponent,
    SharedInputDateComponent,
    SharedInputDateListComponent,
    CheckboxForBookQryComponent,
    CheckboxForAuthorQryComponent,
    CheckboxForReaderQryComponent,
    CheckboxForBooksToReadersQryComponent,
    QryComponent,
  ],

  imports: [
    // SharedModule contains:  Common, BrowserAnimations, ReactiveForms, HttpClient, Materials , GraphQLModule and (declares & exports MatButtonLoadingDirective, SubstringPipe)
    SharedModule,
    SharedTableFactoryModule,// because we are using the tables to present the queries' result
    SearchQryRoutingModule,
  ],

  exports: [QryComponent]
})
export class QryModule { }

import { NgModule } from '@angular/core';

import { SharedModule } from '../04-shared-module/shared-module.module'
import { SharedTableFactoryRoutingModule } from './shared-table-factory-routing.module';


import { BooksTableComponent } from './01-books-table/books-table.component'
import { AuthorsTableComponent } from './02-authors-table/authors-table.component'
import { ReadersTableComponent } from './03-readers-table/readers-table.component'
import { SharedTableComponent } from './shared-table/shared-table.component';


@NgModule({
  declarations: [
    BooksTableComponent,
    AuthorsTableComponent,
    ReadersTableComponent,
    SharedTableComponent
  ],
  imports: [
    // SharedModule contains:  Common, BrowserAnimations, ReactiveForms, HttpClient, Materials , GraphQLModule and (declares & exports MatButtonLoadingDirective, SubstringPipe)
    SharedModule,
    SharedTableFactoryRoutingModule,
  ],
  exports: [
    BooksTableComponent,
    AuthorsTableComponent,
    ReadersTableComponent,
    SharedTableComponent
  ]
})
export class SharedTableFactoryModule { }

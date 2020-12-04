import { NgModule } from '@angular/core';

import { LibraryRoutingModule } from './library-routing.module'


import { SharedModule } from '../04-shared-module/shared-module.module'


import { SharedPaginatedCardsComponent } from './00-shared-components/shared-paginated-cards/shared-paginated-cards.component';
import { SharedCardComponent } from './00-shared-components/card/shared-card.component';
// import { SharedTableComponent } from './00-shared-components/shared-table/shared-table.component';
import { SharedAutocompleteComponent } from './00-shared-components/shared-autocomplete/shared-autocomplete.component';
import { SharedListSelectComponent } from './00-shared-components/shared-list-select/shared-list-select.component';
import { SharedFilteredSelectComponent } from './00-shared-components/shared-filtered-select/shared-filtered-select.component';


import { SharedTableFactoryModule } from '../03-shared-table-factory-module/shared-table-factory.module';


import { BookComponent } from './01-books/book/book.component';
// import { BooksTableComponent } from './01-books/books-table/books-table.component';
import { BookFormComponent } from './01-books/book-form/book-form.component';

import { AuthorComponent } from './02-authors/author/author.component';
// import { AuthorsTableComponent } from './02-authors/authors-table/authors-table.component';
import { AuthorFormComponent } from './02-authors/author-form/author-form.component';

import { ReaderComponent } from './03-readers/reader/reader.component';
import { ReaderFormComponent } from './03-readers/reader-form/reader-form.component';
// import { ReadersTableComponent } from './03-readers/readers-table/readers-table.component';
import { ReaderBtrTableComponent } from './03-readers/reader/reader-btr-table/reader-btr-table.component';

import { BooksToReadersFormComponent } from './04-books-to-readers/books-to-readers-form/books-to-readers-form.component';


@NgModule({
  declarations: [
    SharedCardComponent,
    SharedPaginatedCardsComponent,
    // SharedTableComponent,
    SharedAutocompleteComponent,
    SharedListSelectComponent,
    SharedFilteredSelectComponent,


    
    BookComponent,
    BookFormComponent,
    // BooksTableComponent,

    AuthorComponent,
    AuthorFormComponent,
    // AuthorsTableComponent,

    ReaderComponent,
    ReaderFormComponent,
    // ReadersTableComponent,
    ReaderBtrTableComponent,

    BooksToReadersFormComponent,
  ],

  imports: [
    // SharedModule contains:  Common, BrowserAnimations, ReactiveForms, HttpClient, Materials , GraphQLModule and (declares & exports MatButtonLoadingDirective, SubstringPipe)
    SharedModule,
    SharedTableFactoryModule,// because we are using the tables in reader/booksToReadersTable
    LibraryRoutingModule,
  ],
  exports: []
})
export class LibraryModule { }

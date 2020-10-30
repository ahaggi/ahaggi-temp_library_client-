import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './05-dashboard/dashboard.component'

import { BookComponent } from './01-books/book/book.component'
import { BookFormComponent } from './01-books/book-form/book-form.component'
import { BooksTableComponent } from './01-books/books-table/books-table.component'

import { AuthorComponent  } from './02-authors/author/author.component'
import { AuthorFormComponent } from './02-authors/author-form/author-form.component';
import { AuthorsTableComponent } from './02-authors/authors-table/authors-table.component'


import { ReaderComponent } from './03-readers/reader/reader.component'
import { ReaderFormComponent } from './03-readers/reader-form/reader-form.component'
import { ReadersTableComponent } from './03-readers/readers-table/readers-table.component'

import { CanDeactivateGuard ,} from './can-deactivate.guard'
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  
  { path: 'books', component: BooksTableComponent },
  { path: 'book/:id', component:  BookComponent},
  { path: 'editbook/:id', component:  BookFormComponent , canDeactivate: [CanDeactivateGuard]},
  { path: 'addbook', component:  BookFormComponent, canDeactivate: [CanDeactivateGuard]},

  { path: 'authors', component: AuthorsTableComponent },
  { path: 'author/:id', component: AuthorComponent },
  { path: 'editauthor/:id', component:  AuthorFormComponent , canDeactivate: [CanDeactivateGuard]},
  { path: 'addauthor', component:  AuthorFormComponent, canDeactivate: [CanDeactivateGuard]},


  { path: 'readers', component: ReadersTableComponent },
  { path: 'reader/:id', component: ReaderComponent },
  { path: 'editreader/:id', component:  ReaderFormComponent , canDeactivate: [CanDeactivateGuard]},
  { path: 'addreader', component:  ReaderFormComponent, canDeactivate: [CanDeactivateGuard]},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ 
    CanDeactivateGuard
  ]
})
export class AppRoutingModule {

}

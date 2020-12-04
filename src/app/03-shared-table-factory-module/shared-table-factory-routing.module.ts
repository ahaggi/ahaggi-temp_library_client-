import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { BooksTableComponent } from './01-books-table/books-table.component'
import { AuthorsTableComponent } from './02-authors-table/authors-table.component'
import { ReadersTableComponent } from './03-readers-table/readers-table.component'



const routes: Routes = [
  { path: 'books', component: BooksTableComponent },
  { path: 'authors', component: AuthorsTableComponent },
  { path: 'readers', component: ReadersTableComponent },
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
})
export class SharedTableFactoryRoutingModule { }

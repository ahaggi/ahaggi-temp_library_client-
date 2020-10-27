import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientModule } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatAutocompleteModule} from '@angular/material/autocomplete'; 
import {MatCheckboxModule} from '@angular/material/checkbox'; 
import {ScrollingModule} from '@angular/cdk/scrolling'; 


import { GraphQLModule } from './graphql.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';



import { SharedPaginatedCardsComponent } from './0-shared-components/shared-paginated-cards/shared-paginated-cards.component';

import { SharedCardComponent } from './0-shared-components/card/shared-card.component';
import { SharedTableComponent } from './0-shared-components/shared-table/shared-table.component';
import {  SharedAutocompleteComponent } from './0-shared-components/shared-autocomplete/shared-autocomplete.component';
import {  SharedSelectComponent } from './0-shared-components/shared-select/shared-select.component';

import { BookComponent }       from './01-books/book/book.component';
import { BooksTableComponent } from './01-books/books-table/books-table.component';
import { BookFormComponent } from './01-books/book-form/book-form.component';

import { AuthorComponent } from './02-authors/author/author.component';
import { AuthorsTableComponent } from './02-authors/authors-table/authors-table.component'; 
import { AuthorFormComponent } from './02-authors/author-form/author-form.component'; 

import { ReaderComponent }       from './03-readers/reader/reader.component';
import { ReadersTableComponent } from './03-readers/readers-table/readers-table.component';

import { NavigationBarComponent } from './04-navigation-bar/navigation-bar.component';

import { NotificationsComponent } from './05-dashboard/notifications/notifications.component';
import { DashboardComponent } from './05-dashboard/dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    NavigationBarComponent,
    DashboardComponent,
    
    SharedCardComponent,
    SharedPaginatedCardsComponent,
    SharedTableComponent,
    SharedAutocompleteComponent,
    SharedSelectComponent,

    BookComponent,
    BooksTableComponent,
    BookFormComponent,

    AuthorComponent,
    AuthorsTableComponent,
    AuthorFormComponent,

    ReaderComponent,
    ReadersTableComponent,

    NotificationsComponent,

  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    GraphQLModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    FormsModule, 
    ReactiveFormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    MatExpansionModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    ScrollingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

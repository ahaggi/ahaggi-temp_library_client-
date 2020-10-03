import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { catchError, delay, finalize, map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, of } from 'rxjs';
import { Apollo, Query } from 'apollo-angular';
import gql from 'graphql-tag';
import { MatTableDataSource } from '@angular/material/table';




export interface BooksItem {
  id: string;
  title: string;
  pages: number;
  chapters: number;
  price: number;
}
// id: String!
// title: String
// chapters: Int
// pages: Int
// price: Float
// storage: Storage!
// booksToAuthors: [BooksToAuthors!]!
// booksToReaders: [BooksToReaders!]!


// const EXAMPLE_DATA: BooksItem[] = [

//   { id: '1', title: 'GraphQL book1', pages: 101, chapters: 102, price: 1.3 },
// ..
// ];


export class BooksTableDataSource extends MatTableDataSource<BooksItem> {

  isLoading: boolean = true;
  isLoadingFailed:boolean = false;
  

  constructor(private apollo: Apollo) {
    super();
    this.apollo.watchQuery<_Query>({
      query: gql`
            {
              books{
                id
                title
                chapters
                pages
                price
              }
            }
          `,
    })
      .valueChanges
      .pipe(
        // delay(3000),
        map(res => res.data && res.data.books),
        catchError((err , c) => {
          console.log(err)
          console.log(c)
          this.isLoadingFailed = true;
          return of([] as BooksItem[])}),
        finalize(() => this.isLoading = false)
      )
      .subscribe(books => {
        this.data = books;
        this.isLoading = false;
      });
  }


}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

type _Query = {
  books: BooksItem[];
  book: BooksItem;
}

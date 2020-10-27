import { catchError, delay, finalize, map, takeUntil } from 'rxjs/operators';
import { Observable, of , merge, Subject  } from 'rxjs';
import { Apollo, Query } from 'apollo-angular';
import gql from 'graphql-tag';
import { MatTableDataSource } from '@angular/material/table';
import { getBooksQry } from '../util/queriesDef';




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
      query:getBooksQry,
    })
      .valueChanges
      .pipe(
        // delay(3000),
      takeUntil(this._ngUnsubscribe$),

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

  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }


}



type _Query = {
  books: BooksItem[];
  book: BooksItem;
}

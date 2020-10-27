import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { of, Subject } from 'rxjs';
import { catchError, finalize, map, takeUntil } from 'rxjs/operators';
import gql from 'graphql-tag';

import { loadImageFromStorage, ImgCategory } from '../../util/util'
import { sharedTableCellIndex, sharedTableCellText, sharedTableCellImg, sharedTableCellChiplist, sharedTableCellButton, Payload, sharedTableCellKind } from '../../0-shared-components/shared-table/shared-table.component'
import { getAuthorsQry } from 'src/app/util/queriesDef';

@Component({
  selector: 'app-authors-table',
  templateUrl: './authors-table.component.html',
  styleUrls: ['./authors-table.component.css']
})
export class AuthorsTableComponent implements OnInit {
  payload: Payload<_AuthorCells>;
  isLoading: boolean = true;
  isLoadingFailed: boolean = false;

  constructor(private apollo: Apollo) { }
  ngOnInit(): void {

    this.apollo.watchQuery<_Query>({
      query: getAuthorsQry,
    })
      .valueChanges
      .pipe(
        // delay(3000),
      takeUntil(this._ngUnsubscribe$),

        map(res => {
          console.log(res)
          return res.data.authors
        }),

        catchError((err, c) => {
          console.log(err)
          console.log(c)
          this.isLoadingFailed = true;
          return of([] as _AuthorCells[])
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(authors => {

        let _data = this.formatData(authors)
        let _temp_displayedCols = Object.keys(_data[0])
        let colStyling = {
          id: { flexGrow: 0.5 },
          imgUri: { flexGrow: 1 },
          name: { flexGrow: 1 },
          email: { flexGrow: 2 },
          about: { flexGrow: 5 },
          books: { flexGrow: 5 },
        }

        this.payload = {
          data: _data,
          displayedColumns: _temp_displayedCols,
          colStyling: colStyling,
          filterInputPlaceHolder: "Filter By Author's Name or Email, or Book's Title Only....",
          filterPredicate: (author, filter: string): boolean => {
            let foldUntilTrue = (acc, book, _, arr) => {
              // folding until one of the values become true or to the endOfList, 
              if (acc) {
                // mutate the array to prevent further testing
                arr.splice(0);
                return true;
              }
              return book.viewValue.toLowerCase().includes(filter.toLowerCase())
            }
            return (
              author.name.viewValue.toLowerCase().includes(filter.toLowerCase()) ||
              author.email.viewValue.toLowerCase().includes(filter.toLowerCase()) ||
              (author.books.arr.slice().reduce(foldUntilTrue, false))

            );
          }
        }
        this.isLoading = false;
      });
  }

  formatData(authors): _AuthorCells[] {

    let cells = authors.map((elm) => {
      let tempBooks = elm?.booksToAuthors?.map(({ book: { id, title } }) => { return { viewValue: title, routerLink: `/book/${id}` } });
      let tempImg = { alt: elm?.name, src: loadImageFromStorage(elm?.imgUri, ImgCategory.PERSON), height: "48", width: "48", _kind: sharedTableCellKind.IMAGE }

      let book: _AuthorCells = {
        id: { representValue: elm?.id, _kind: sharedTableCellKind.INDEX },
        imgUri: tempImg,
        name: { viewValue: elm?.name, _kind: sharedTableCellKind.TEXT, routerLink: `/author/${elm?.id}` },
        email: { viewValue: elm?.email, _kind: sharedTableCellKind.TEXT },
        about: { viewValue: elm?.about, _kind: sharedTableCellKind.TEXT },
        books: { arr: tempBooks, _kind: sharedTableCellKind.CHIP_LIST },
      };
      return book;
    })
    return cells;
  }

  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }

}




interface _Query {
  authors: _AuthorCells[];
}

export type _AuthorCells = {
  id?: sharedTableCellIndex;
  imgUri?: sharedTableCellImg;
  name?: sharedTableCellText;
  email?: sharedTableCellText;
  about?: sharedTableCellText;
  books?: sharedTableCellChiplist;
}

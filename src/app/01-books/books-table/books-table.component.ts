import { Component, Input, OnInit } from '@angular/core';

import { catchError, delay, finalize, map, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';



import { sharedTableCellIndex, sharedTableCellText, sharedTableCellImg, sharedTableCellChiplist, sharedTableCellButton, Payload, sharedTableCellKind } from '../../0-shared-components/shared-table/shared-table.component'
import { loadImageFromStorage, ImgCategory } from '../../util/util'
import { deleteBookMut } from 'src/app/util/mutationsDef';
import { getBooksQry } from 'src/app/util/queriesDef';




@Component({
  selector: 'app-books-table',
  templateUrl: './books-table.component.html',
  styleUrls: ['./books-table.component.css']
})
export class BooksTableComponent implements OnInit {

  // show full bookTable or just some of the columns
  @Input()
  mode?: MODE = MODE.FULL_TABLE;

  payload: Payload<_BookCells>;
  isLoading: boolean = true;
  isLoadingFailed: boolean = false;


  constructor(private apollo: Apollo) { }
  ngOnInit(): void {

    this.apollo.watchQuery<_Query>({
      query: getBooksQry,
    })
      .valueChanges
      .pipe(
        // delay(200000),
        takeUntil(this._ngUnsubscribe$),

        map(res => {
          console.log(res)
          return res.data.books
        }),

        catchError((err, c) => {
          console.log(err)
          console.log(c)
          this.isLoadingFailed = true;
          return of([] as _BookCells[])
        }),
        // finalize(() => this.isLoading = false) wouldn't work with "watchQuery" without using for ex. "take(1)" to close the stream
      )
      .subscribe(books => {
        this.payload = this.createPayload(books)
        this.isLoading = false;
      });

  }

  createPayload(books): Payload<_BookCells> {

    let data = books.map((elm) => {
      let tempAuthors = elm?.booksToAuthors?.map(({ author: { id, name } }) => { return { viewValue: name, routerLink: `/author/${id}` } });
      let tempImg: sharedTableCellImg = { alt: elm?.title, src: loadImageFromStorage(elm?.imgUri, ImgCategory.BOOK), height: "48", width: "48", _kind: sharedTableCellKind.IMAGE }

      let book: _BookCells = {
        id: { representValue: elm?.id, _kind: sharedTableCellKind.INDEX },
        imgUri: tempImg,
        title: { viewValue: `${elm?.title}\n${elm?.isbn}`, _kind: sharedTableCellKind.TEXT, routerLink: `/book/${elm?.id}` },
        // isbn: { viewValue: elm?.isbn, _kind: sharedTableCellKind.TEXT, routerLink: `/book/${elm?.id}` },
        authors: { arr: tempAuthors, _kind: sharedTableCellKind.CHIP_LIST },
        storage: { viewValue: elm?.storage?.quantity, _kind: sharedTableCellKind.TEXT },
        pages: { viewValue: elm?.pages, _kind: sharedTableCellKind.TEXT },
        chapters: { viewValue: elm?.chapters, _kind: sharedTableCellKind.TEXT },
        price: { viewValue: elm?.price, _kind: sharedTableCellKind.TEXT },
        bottun: { viewValue: "Delete!", _kind: sharedTableCellKind.BUTTON },

      };
      return book;
    })

    // NOTE: keys ordering determine which columns are shown and the colomns' ordering inside the table
    let keys = [
      "id",
      "imgUri",
      "title",
      // "isbn",
      "authors",
      "storage"];
    if (this.mode !== MODE.SUMMARIZED) {
      keys = [
        ...keys,
        "pages",
        "chapters",
        "price",
        "bottun",

      ]
    }


    let displayedColumns = {
      id: "Nr.",
      title: "Title",
      // isbn: "ISBN",
      pages: "Pages",
      chapters: "Chapters",
      price: "Price",
      authors: "Authors' name",
      storage: "Quantity",
      imgUri: " ",
      bottun: " ",
    }

    let colStyle = {
      id: { flexGrow: 1 },
      title: { flexGrow: 3 },
      // isbn: { flexGrow: 2 },
      pages: { flexGrow: 1 },
      chapters: { flexGrow: 1 },
      price: { flexGrow: 1 },
      authors: { flexGrow: 3 },
      storage: { flexGrow: 1 },
      imgUri: { flexGrow: 1 },
      bottun: { flexGrow: 1 },
    }

    let filterInputPlaceHolder = "Filter by Title, ISBN or an Author's Name Only....";

    let filterPredicate = (book, filter: string): boolean => {
      // take at more efficient sol at authors-table.component.ts
      let term = filter.toLowerCase()
      let reducer = (acc, aut) => acc || aut.viewValue.toLowerCase().includes(term)
      return (
        book.title.viewValue.toLowerCase().includes(term) ||
        book.isbn.viewValue.toLowerCase().includes(term) ||
        (book.authors.arr.reduce(reducer, false))
      );
    }

    return { keys, data, displayedColumns, colStyle, filterInputPlaceHolder, filterPredicate };
  }

  deleteElm(id) {
    this.apollo.mutate({
      variables: {
        id: id
      },
      mutation: deleteBookMut,
      refetchQueries: [{
        query: getBooksQry
      }]

    }).pipe(
      takeUntil(this._ngUnsubscribe$),
    )

      .subscribe((v: any) => {
        console.log(v.data.deleteBook.title)
      })
  }


  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }


}

export enum MODE {
  FULL_TABLE,
  SUMMARIZED
}


interface _Query {
  books: _BookCells[];
}


export type _BookCells = {
  id?: sharedTableCellIndex;
  title?: sharedTableCellText;
  // isbn?:sharedTableCellText;
  pages?: sharedTableCellText;
  chapters?: sharedTableCellText;
  price?: sharedTableCellText;
  authors?: sharedTableCellChiplist
  storage?: sharedTableCellText;
  imgUri?: sharedTableCellImg;
  bottun?: sharedTableCellButton;
}

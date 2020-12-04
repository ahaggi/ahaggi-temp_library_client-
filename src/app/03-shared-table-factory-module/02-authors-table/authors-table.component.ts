import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { of, Subject, Observable } from 'rxjs';
import { catchError, finalize, map, takeUntil } from 'rxjs/operators';



import { sharedTableCellIndex, sharedTableCellText, sharedTableCellImg, sharedTableCellChiplist, sharedTableCellButton, Payload, sharedTableCellKind } from '../../03-shared-table-factory-module/shared-table/shared-table.component'
import { getAuthorsQry } from '../../util/gqlUtil/queriesDef';

@Component({
  selector: 'app-authors-table',
  templateUrl: './authors-table.component.html',
  styleUrls: ['./authors-table.component.css']
})
export class AuthorsTableComponent implements OnInit {
  @Input()
  authorsObsv?: Observable<any>

  payload: Payload<_AuthorCells>;
  isLoading: boolean = true;
  isLoadingFailed: boolean = false;

  constructor(private apollo: Apollo) { }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.hasOwnProperty('authorsObsv') && changes['authorsObsv'].currentValue != null) {
      this.authorsObsv = changes['authorsObsv'].currentValue;
      this.subscribeToSrc()
    }
  }

  ngOnInit(): void {
    if (!this.authorsObsv)
      this.authorsObsv = this.getAllAuthorsFromServerAsObsv()

    this.subscribeToSrc()
  }

  getAllAuthorsFromServerAsObsv() {
    return this.apollo.watchQuery<any>({
      query: getAuthorsQry,
    })
      .valueChanges
  }

  subscribeToSrc() {
    this.authorsObsv.pipe(
      // delay(3000),
      takeUntil(this._ngUnsubscribe$),

      map((res: any) => {
        console.log(res)
        return res.data.authors
      }),
      catchError((err, c) => {
        console.log(err)
        console.log(c)
        this.isLoadingFailed = true;
        return of([] as _AuthorCells[])
      }),
      // finalize(() => this.isLoading = false) wouldn't work with "watchQuery" without using for ex. "take(1)" to close the stream
    )
      .subscribe(authors => {
        this.payload = this.createPayload(authors)
        this.isLoading = false;
      });
  }

  createPayload(authors): Payload<_AuthorCells> {

    let data = authors.map((elm) => {
      let tempBooks = elm?.booksToAuthors?.map(({ book: { id, title } }) => { return { viewValue: title, routerLink: `/book/${id}` } });
      // let tempImg = { alt: elm?.name, src: loadImageFromStorage(elm?.imgUri, ImgCategory.PERSON), height: "48", width: "48", _kind: sharedTableCellKind.IMAGE }

      let author: _AuthorCells = {
        id: { representValue: elm?.id, _kind: sharedTableCellKind.INDEX },
        // imgUri: tempImg,
        name: { viewValue: elm?.name, _kind: sharedTableCellKind.TEXT, routerLink: `/author/${elm?.id}` },
        email: { viewValue: elm?.email, _kind: sharedTableCellKind.TEXT },
        about: { viewValue: elm?.about, _kind: sharedTableCellKind.TEXT },
        books: { arr: tempBooks, _kind: sharedTableCellKind.CHIP_LIST },
      };
      return author;
    })

    // NOTE: keys ordering determine which columns are shown and the colomns' ordering inside the table
    let keys = [
      "id",
      // "imgUri",
      "name",
      "email",
      "about",
      "books",
    ]

    let displayedColumns = {
      id: "Nr.",
      // imgUri: " ",
      name: "Name",
      email: "Email",
      about: "About",
      books: "Books",
    }

    let colStyle = {
      id: { flexGrow: 0.5 },
      // imgUri: { flexGrow: 1 },
      name: { flexGrow: 1 },
      email: { flexGrow: 2 },
      about: { flexGrow: 5 },
      books: { flexGrow: 5 },
    }

    let filterInputPlaceHolder = "Filter By Author's Name or Email, or Book's Title Only....";
    let filterPredicate = (author, filter: string): boolean => {
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

    return { keys, data, displayedColumns, colStyle, filterInputPlaceHolder, filterPredicate }
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

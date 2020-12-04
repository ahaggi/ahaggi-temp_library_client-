import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { of, Subject } from 'rxjs';
import { catchError, finalize, map, takeUntil } from 'rxjs/operators';
import { Payload, sharedTableCellButton, sharedTableCellIcon, sharedTableCellImg, sharedTableCellIndex, sharedTableCellKind, sharedTableCellText } from '../../../../03-shared-table-factory-module/shared-table/shared-table.component';
import { deleteBooksToReadersMut } from '../../../../util/gqlUtil/mutationsDef';
import { getBookByIDQry, getReaderByIDQry } from '../../../../util/gqlUtil/queriesDef';
import { formatDateAndTime, ImgCategory, loadImageFromStorage } from '../../../../util/util';

@Component({
  selector: 'app-reader-btr-table',
  templateUrl: './reader-btr-table.component.html',
  styleUrls: ['./reader-btr-table.component.css']
})
export class ReaderBtrTableComponent implements OnInit {

  @Input()
  booksToReaders: [];

  @Input()
  readerId: string;

  payload: Payload<_ReaderBtrCells>;
  isLoading: boolean = true;
  // isLoadingFailed: boolean = false;


  constructor(private apollo: Apollo) { }
  ngOnInit(): void {

    console.log("ReaderBtrTableComponent ReaderBtrTableComponent ReaderBtrTableComponent")
    console.log(this.readerId)
    console.log(this.booksToReaders)

  }


  // Intercept inputs property changes with ngOnChanges
  // https://angular.io/guide/component-interaction
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    // let btr_bool = changes.hasOwnProperty('booksToReaders')
    // let rId_bool = changes.hasOwnProperty('readerId')
    for (const propName in changes) {
      switch (propName) {
        case 'booksToReaders':
          this.booksToReaders = changes['booksToReaders'].currentValue
          console.log("\n\n\n")
          console.log(`booksToReaders  isFirstChange ==> ${changes?.booksToReaders?.isFirstChange()} `)
          console.log("\n\n\n")
          break;
        case 'readerId':
          this.readerId = changes['readerId'].currentValue
          console.log("\n\n\n")
          console.log(`readerId  isFirstChange ==> ${changes?.readerId?.isFirstChange()} `)
          console.log("\n\n\n")
          break;
        default:
          break;
      }
    }

    this.payload = this.createPayload(this.booksToReaders)
    this.isLoading = false;

  }


  createPayload(btrs): Payload<_ReaderBtrCells> {
    console.log(btrs)

    let data = btrs?.map((elm) => {
      let tempBookImg: sharedTableCellImg = { alt: elm?.title, src: loadImageFromStorage(elm?.book?.imgUri, ImgCategory.BOOK), height: "48", width: "48", _kind: sharedTableCellKind.IMAGE }
      let _materialIconName: string;
      let remainingTime;
      let _remainingTime_viewValue = "/"


      let _rowStyle = {}, _cellStyle = {};


      if (elm.returned) {
        _materialIconName = "check_circle_outline"
      } else {
        remainingTime = JSON.parse(elm.remainingTime)
        if (remainingTime) {
          if (remainingTime.overdue) {
            _materialIconName = "cancel_outline"
            _remainingTime_viewValue = '-'
            // _rowStyle = { backgroundColor: 'red' }
            _cellStyle = { backgroundColor: 'red', color: 'white' }
          } else {
            _materialIconName = "hourglass_top"
            _remainingTime_viewValue = ''
          }
          _remainingTime_viewValue += `${remainingTime.DD} DD, ${remainingTime.HH} HH, ${remainingTime.MM} MM`

        } else {
          _materialIconName = "info_outline"
        }
      }

      let { date: bd, time: bt } = formatDateAndTime(elm?.borrowDate)
      let { date: rd, time: rt } = formatDateAndTime(elm?.returnDate)

      let btr: _ReaderBtrCells = {
        id: { representValue: elm?.id, _kind: sharedTableCellKind.INDEX },
        imgUri: tempBookImg,
        title: { viewValue: `${elm?.book?.title}\n${elm?.book?.isbn}`, _kind: sharedTableCellKind.TEXT, routerLink: `/book/${elm?.book?.id}` },
        // isbn: { viewValue: elm?.book?.isbn, _kind: sharedTableCellKind.TEXT, routerLink: `/book/${elm?.book?.id}` },
        returned: { materialIconName: _materialIconName, _kind: sharedTableCellKind.ICON },
        remainingTime: { viewValue: _remainingTime_viewValue, _kind: sharedTableCellKind.TEXT, cellStyle: _cellStyle },
        borrowDate: { viewValue: `${bd}\n${bt}`, _kind: sharedTableCellKind.TEXT },
        returnDate: { viewValue: `${rd}\n${rt}`, _kind: sharedTableCellKind.TEXT },
        bottun: { viewValue: "Delete!", _kind: sharedTableCellKind.BUTTON },
        rowStyle: _rowStyle
      };

      return btr;
    })

    // NOTE: keys ordering determine which columns are shown and the colomns' ordering inside the table
    let keys = [
      "id",
      "imgUri",
      "title",
      // "isbn",
      "returned",
      "remainingTime",
      "borrowDate",
      "returnDate",
      "bottun",
    ]

    let displayedColumns = {
      id: "Nr.",
      imgUri: " ",
      title: "Book's Title",
      // isbn: "ISBN",
      returned: "Returned",
      remainingTime: "Remaining Time",
      borrowDate: "Borrow Date",
      returnDate: "Return Date",
      bottun: " ",
    }

    let colStyle = {
      id: { flexGrow: 0.5 },
      imgUri: { flexGrow: 1 },
      title: { flexGrow: 3 },
      // isbn: { flexGrow: 2,  },
      returned: { flexGrow: 1 },
      remainingTime: { flexGrow: 2 },
      borrowDate: { flexGrow: 2 },
      returnDate: { flexGrow: 2 },
      bottun: { flexGrow: 1 },
    }

    let filterInputPlaceHolder = "Filter by book's Title or ISBN..";
    let filterPredicate = (btr, filter: string): boolean => {
      let term = filter.toLowerCase()
      return (
        btr.title.viewValue.toLowerCase().includes(term)
        // ||
        // btr.isbn.viewValue.toLowerCase().includes(term)
      );
    }
    return { keys, data, displayedColumns, colStyle, filterInputPlaceHolder, filterPredicate };
  }

  deleteElm(id) {

    let _btrElm: any = this.booksToReaders.find((btr: any) =>
      btr.id == id
    )

    let _bID = _btrElm.book.id
    // let _rID = _btrElm.reader.id  // the same as this.readerId

    console.log(_btrElm)

    this.apollo.mutate({
      variables: { id: id },
      mutation: deleteBooksToReadersMut,
      refetchQueries: [
        {
          query: getBookByIDQry,
          variables: { id: _bID },
        },
        {
          query: getReaderByIDQry,
          variables: { id: this.readerId },
        }
      ],

    }).pipe(
      takeUntil(this._ngUnsubscribe$),
    )
      .subscribe((v: any) => {
        console.log(v.data.deletedBtr.id)
        
      })
  }



  
  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }


}

export type _ReaderBtrCells = {
  id: sharedTableCellIndex;
  imgUri: sharedTableCellImg;
  title: sharedTableCellText;
  // isbn: sharedTableCellText;
  returned: sharedTableCellIcon;
  borrowDate: sharedTableCellText;
  returnDate: sharedTableCellText;
  remainingTime: sharedTableCellText;
  bottun: sharedTableCellButton;
  rowStyle: any

}
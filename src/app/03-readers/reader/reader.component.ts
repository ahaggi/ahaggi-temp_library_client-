import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';



import { _ReaderCells } from '../readers-table/readers-table.component';
import { loadImageFromStorage, ImgCategory } from '../../util/util'
import { getReaderByIDQry } from 'src/app/util/queriesDef';


@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css']
})
export class ReaderComponent implements OnInit {

  reader: _Reader = {} as _Reader
  // = {id:"1" , name:"user1" , email:"a@a.com" , imgUri:"assets/img/PersonsImgs/placeHolder1.png"};

  booksToReadersOptions = [
    { value: ORDER_BY.BORROW_DATE, viewValue: 'Borrowing Date' },
    { value: ORDER_BY.RETURN_DATE, viewValue: 'Return Date' },
    { value: ORDER_BY.RETURNED, viewValue: 'Return Status' },
  ]
  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,

  ) {
  }

  BTRformVisible = false
  showBTRform(bool){
     this.BTRformVisible = bool
  }

  ngOnInit(): void {
    this.getReader()
  }

  getReader(): void {
    const id: string = this.route.snapshot.paramMap.get('id');
    this.apollo.watchQuery<_Reader>({
      variables: { id: id },
      query: getReaderByIDQry,
    })
      .valueChanges
      .pipe(
        // delay(3000),
      takeUntil(this._ngUnsubscribe$),

        map((res: any) => {
          console.log(res)
          return res.data.reader
        }),
        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of({}) // TODO
        }),

      ).subscribe((reader) => {
        console.log(reader)
        this.reader.id = reader.id
        this.reader.name = reader.name
        this.reader.email = reader.email
        this.reader.costumerId = reader.costumerId
        this.reader.phone = reader.phone
        this.reader.address = reader.address
        this.reader.booksToReaders = [...reader.booksToReaders]
        this.reader.imgUri = loadImageFromStorage(reader?.imgUri, ImgCategory.PERSON)
      })
  }

  // sortBorrowingInfoBy(order_by) {
  //   let sorting_func
  //   if (order_by === ORDER_BY.BORROW_DATE || order_by === ORDER_BY.RETURN_DATE) {
  //     sorting_func = (a, b) => {
  //       let x: Date = new Date(a[order_by]);
  //       let y: Date = new Date(b[order_by]);

  //       if (Object.prototype.toString.call(x) !== "[object Date]") {
  //         x = new Date();
  //       }
  //       if (Object.prototype.toString.call(x) !== "[object Date]") {
  //         y = new Date();
  //       }

  //       return y.getTime() - x.getTime();
  //     }
  //   } else { // if(order_by === ORDER_BY.RETURNED)
  //     sorting_func = (a: boolean, b: boolean) => {
  //       return a[order_by] == b[order_by] ? 0 : (a[order_by] ? 1 : -1)
  //     }
  //   }

  //   this.reader.booksToReaders.sort(sorting_func)
  // }
  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }

}


export type _Reader = {
  id: string;
  name: string;
  email: string;
  costumerId: string;
  imgUri: string;
  address: string;
  phone: string;
  booksToReaders: any[];
}

const ORDER_BY = { BORROW_DATE: "borrowDate", RETURN_DATE: "returnDate", RETURNED: "returned" };

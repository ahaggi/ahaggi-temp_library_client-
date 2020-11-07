import { Component, OnInit } from '@angular/core';
import { catchError, finalize, map, flatMap, scan, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { sharedTableCellIndex, sharedTableCellText, sharedTableCellImg, Payload, sharedTableCellKind } from '../../0-shared-components/shared-table/shared-table.component'
import { loadImageFromStorage, ImgCategory } from '../../util/util'
import { getReadersQry } from 'src/app/util/queriesDef';

@Component({

  selector: 'app-readers-table',
  templateUrl: './readers-table.component.html',
  styleUrls: ['./readers-table.component.css']
})
export class ReadersTableComponent implements OnInit {

  payload: Payload<_ReaderCells>;
  isLoading: boolean = true;
  isLoadingFailed: boolean = false;



  constructor(private apollo: Apollo) {


  }
  ngOnInit(): void {
    this.apollo.watchQuery<_Query>({
      query: getReadersQry,
    })
      .valueChanges
      .pipe(
        takeUntil(this._ngUnsubscribe$),

        map(res => res.data.readers),
        catchError((err, c) => {
          console.log(err)
          console.log(c)
          this.isLoadingFailed = true;
          return of([] as _ReaderCells[])
        }),
        // finalize(() => this.isLoading = false) wouldn't work with "watchQuery" without using for ex. "take(1)" to close the stream
      )
      .subscribe(readers => {
        console.log(readers)
        this.payload = this.createPayload(readers)
        this.isLoading = false;
      });
  }


  createPayload(readers): Payload<_ReaderCells> {

    let data = readers.map((elm) => {
      // let tempImg = { alt: elm?.name, src: loadImageFromStorage(elm?.imgUri, ImgCategory.PERSON), height: "48", width: "48", _kind: sharedTableCellKind.IMAGE }

      let reader: _ReaderCells = {
        id: { representValue: elm?.id, _kind: sharedTableCellKind.INDEX },
        // imgUri: tempImg,
        name: { viewValue: elm?.name, _kind: sharedTableCellKind.TEXT, routerLink: `/reader/${elm?.id}` },
        costumerId: { viewValue: elm?.costumerId, _kind: sharedTableCellKind.TEXT },
        email: { viewValue: elm?.email, _kind: sharedTableCellKind.TEXT },
        address: { viewValue: elm?.address, _kind: sharedTableCellKind.TEXT },
        phone: { viewValue: elm?.phone, _kind: sharedTableCellKind.TEXT },
      };
      return reader;
    })

    // NOTE: keys ordering determine which columns are shown and the colomns' ordering inside the table
    let keys = [
      "id",
      "name",
      "costumerId",
      "email",
      "address",
      "phone",
      // "imgUri",
    ]

    let displayedColumns = {
      id: "Nr.",
      name: "Name",
      costumerId:"costumer Id",
      email: "Email",
      address:"Address",
      phone:"Phone nr.",

      // imgUri: " ",
    }
    let colStyle = {
      id: { flexGrow: 0.5 },
      name: { flexGrow: 2 },
      costumerId: { flexGrow: 2 },
      email: { flexGrow: 1 },
      address: { flexGrow: 2 },
      phone: { flexGrow: 1 },
      // imgUri: { flexGrow: 1 },
    }
    let filterInputPlaceHolder = "Filter By Reader's Name or Email Only....";
    let filterPredicate = (data, filter: string): boolean => {
      return (
        data.name.viewValue.toLowerCase().includes(filter.toLowerCase()) ||
        data.email.viewValue.toLowerCase().includes(filter.toLowerCase())
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




export type _ReaderCells = {
  id?: sharedTableCellIndex;
  name?: sharedTableCellText;
  costumerId: sharedTableCellText;
  email?: sharedTableCellText;
  address: sharedTableCellText;
  phone: sharedTableCellText;
  // imgUri?: sharedTableCellImg;
}



interface _Query {
  readers: _ReaderCells[];
}
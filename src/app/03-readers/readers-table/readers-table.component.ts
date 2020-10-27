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
        finalize(() => this.isLoading = false)
      )
      .subscribe(readers => {

        console.log(readers)

        let _data = this.formatData(readers)
        let _temp_displayedCols = Object.keys(_data[0])
        let colStyling = {
          id: { flexGrow: 0.5 },
          name: { flexGrow: 2 },
          email: { flexGrow: 2 },
          imgUri: { flexGrow: 1 },
        }

        this.payload = {
          data: _data,
          displayedColumns: _temp_displayedCols,
          colStyling: colStyling,
          filterInputPlaceHolder: "Filter By Reader's Name or Email Only....",
          filterPredicate: (data, filter: string): boolean => {
            return (
              data.name.viewValue.toLowerCase().includes(filter.toLowerCase()) ||
              data.email.viewValue.toLowerCase().includes(filter.toLowerCase())
            );
          }
        }
        this.isLoading = false;
      });
  }
  formatData(readers): _ReaderCells[] {
    let cells = readers.map((elm) => {
      let tempImg = { alt: elm?.name, src: loadImageFromStorage(elm?.imgUri, ImgCategory.PERSON), height: "48", width: "48", _kind: sharedTableCellKind.IMAGE }

      let reader: _ReaderCells = {
        id: { representValue: elm?.id, _kind: sharedTableCellKind.INDEX },
        imgUri: tempImg,
        name: { viewValue: elm?.name, _kind: sharedTableCellKind.TEXT, routerLink: `/reader/${elm?.id}` },
        email: { viewValue: elm?.email, _kind: sharedTableCellKind.TEXT },
      };
      return reader;
    })
    return cells
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
  email?: sharedTableCellText;
  imgUri?: sharedTableCellImg;
}



interface _Query {
  readers: _ReaderCells[];
}
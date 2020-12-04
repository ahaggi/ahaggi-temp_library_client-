import { AfterViewInit, Component, OnInit, Input, ViewChild, EventEmitter, Output, SimpleChange } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
// import { MatTable } from '@angular/material/table';

import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-shared-table',
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.css']
})

export class SharedTableComponent<T> implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  // @ViewChild(MatTable) table: MatTable<T>;
  keys: string[];

  dataSource: MatTableDataSource<T>;
  displayedColumns: any;
  colStyle?: any;
  filterInputPlaceHolder: string;

  @Input()
  payload: Payload<T>;

  @Output()
  deleteRequest = new EventEmitter<any>();  //OBS @output

  elemIdToDelete = null
  delete(arg) {
    this.elemIdToDelete = arg
    this.deleteRequest.emit(arg);

    setTimeout(() => { 
      this.elemIdToDelete = null
     }, 1000);
  }

  ngOnInit() {

    this.keys = this.payload.keys
    this.displayedColumns = this.payload.displayedColumns;
    this.colStyle = this.payload.colStyle;
    this.dataSource = new MatTableDataSource(this.payload.data);
    this.dataSource.filterPredicate = this.payload.filterPredicate;
    this.filterInputPlaceHolder = this.payload.filterInputPlaceHolder || "Filter By Name Only...."

    this.dataSource.sortingDataAccessor = (row, sortHeaderId: string) => {
      //              sortingDataAccessor: ((data: T, sortHeaderId: string) => string | number)

      //forEach row do the flwg
      let cell = row[sortHeaderId]
      if (cell._kind === sharedTableCellKind.TEXT) {
        return cell.viewValue
      } else if (cell._kind === sharedTableCellKind.INDEX) {
        return this.dataSource.filteredData.indexOf(row)
      } else if (cell._kind === sharedTableCellKind.ICON) {
        return cell.materialIconName
      }

      
      // if cell._kind is one of:
      // sharedTableCellKind.BUTTON
      // sharedTableCellKind.CHIP_LIST
      // sharedTableCellKind.IMAGE
      // DON'T sort
      return ""
    }

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.firstPage());
  }



  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // Intercept inputs property changes with ngOnChanges
  // https://angular.io/guide/component-interaction
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    // if (changes['listOfAllOptions'].isFirstChange()) { // Due to initialization by angular
    //   doStuff();
    // } else {  // due to business logic 
    //   doMoreStuff();
    // }

    this.payload = changes['payload'].currentValue;
    if (this.dataSource != null) {
      this.dataSource.data = this.payload.data
    }
  }

}


export interface Payload<T> {
  keys: string[];
  data: T[];
  displayedColumns: any;
  colStyle?: any;
  filterInputPlaceHolder?: string;
  filterPredicate?: (data: T, filter: string) => boolean
}

export enum sharedTableCellKind {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  CHIP_LIST = "CHIP_LIST",
  BUTTON = "BUTTON",
  INDEX = "INDEX",
  ICON = "ICON"
}

// export type img = { alt: any; src: string, width: string, height: string }

// export type chiplist = [{ value: any; uri: string }]
// export type button = { value: any; event: string; fn: any }


export type sharedTableCellIndex = { _kind: sharedTableCellKind, representValue: string , cellStyle?: any}
export type sharedTableCellText = { _kind: sharedTableCellKind, viewValue: string, routerLink?: string , cellStyle?: any}
export type sharedTableCellImg = { _kind: sharedTableCellKind, alt: any, src: string, width: string, height: string, routerLink?: string }
export type sharedTableCellChiplist = { _kind: sharedTableCellKind, arr: [{ viewValue: any, routerLink: string }] }
export type sharedTableCellButton = { _kind: sharedTableCellKind, viewValue: any, routerLink?: string }
export type sharedTableCellIcon = { _kind: sharedTableCellKind, materialIconName: string, routerLink?: string }

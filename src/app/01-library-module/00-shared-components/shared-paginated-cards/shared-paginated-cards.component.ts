import { ChangeDetectorRef, Input, SimpleChange } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';



@Component({
  selector: 'app-shared-paginated-cards',
  templateUrl: './shared-paginated-cards.component.html',
  styleUrls: ['./shared-paginated-cards.component.css']
})
export class SharedPaginatedCardsComponent<T> implements OnInit {
  @Input()
  payload: _PaginatedCardsPayload<T>;

  dataSource: MatTableDataSource<T> = new MatTableDataSource<T>();
  //this is to extract (the data from this.dataSource) with asyncPipe inside the template, since we will use the dataSource without the "mat-table"
  obs$: any = this.dataSource.connect();

  filterInputPlaceholder: string;

  pageSize: number
  pageSizeOptions: number[]

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    /* 
    used "this.changeDetectorRef.detectChanges()", to avoid
    ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    https://stackoverflow.com/questions/34364880/expression-has-changed-after-it-was-checked 
    */
    // this.changeDetectorRef.detectChanges();


  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngAfterViewInit(): void {
    if (this.dataSource) {
      setTimeout(() => {
        this.dataSource.paginator = this.paginator
      });
    }
  }

  // @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
  //   this.dataSource.paginator = mp;
  // }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    // if (changes['listOfAllOptions'].isFirstChange()) { // Due to initialization by angular
    //   doStuff();
    // } else {  // due to business logic 
    //   doMoreStuff();
    // }
    if (changes.hasOwnProperty('payload')) {

      this.payload = changes['payload'].currentValue;
      this.dataSource.data = []

      this.dataSource.data = this.payload.cards

      this.dataSource.filterPredicate = this.payload.filterPredicate;

      this.filterInputPlaceholder = this.payload.filterInputPlaceholder
      this.pageSize = this.payload.pageSize || 5
      this.pageSizeOptions = this.payload.pageSizeOptions

    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

}



export type _PaginatedCardsPayload<T> = {
  cards: T[];
  filterPredicate: any;
  filterInputPlaceholder: string;
  pageSize?: number,
  pageSizeOptions?: number[]
}
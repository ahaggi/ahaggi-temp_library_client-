import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Apollo } from 'apollo-angular';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { SharedFilteredSelectPayload, _Option } from 'src/app/0-shared-components/shared-filtered-select/shared-filtered-select.component';
import { updateBookMut, updateReaderMut } from 'src/app/util/mutationsDef';
import { getBookByIDQry, getBooksQry, getReaderByIDQry, getReadersQry } from 'src/app/util/queriesDef';


@Component({
  selector: 'app-books-to-readers-form',
  templateUrl: './books-to-readers-form.component.html',
  styleUrls: ['./books-to-readers-form.component.css']
})

export class BooksToReadersFormComponent implements OnInit {

  // this will be either bookId or readerId, depending on MODE
  @Input()
  id: string;

  @Input()
  MODE: FORM_MODE;

  @Output()
  cancelRequest = new EventEmitter<boolean>();

  hideBTRform() {
    this.cancelRequest.emit(false);
  }

  isLoading: boolean = false;
  isLoadingFailed: boolean = false;

  // Holds the values which presented in the html
  formGroup: FormGroup;


  sharedFilteredSelectPayload: SharedFilteredSelectPayload;



  minDateRange: Date;
  maxDateRange: Date;

  constructor(private apollo: Apollo, private formBuilder: FormBuilder) { }



  ngOnInit(): void {

    // consider it that there's some date range validation on the backend
    this.minDateRange = new Date()
    this.maxDateRange = new Date();
    this.maxDateRange.setMonth(this.maxDateRange.getMonth() + 1)

    this.formGroup = this.formBuilder.group({
      borrowPeriod: this.formBuilder.group({
        borrowDate: ['', [Validators.required]],
        returnDate: ['', [Validators.required]],
      }),
      selectedOptionId: [{ selectedOption: '' }], // This is A FORMGROUP of the childComponent SharedFilteredSelectComponent
    })


    this.initData()


  }

  get borrowPeriodControllers() {
    let bp = (this.formGroup.controls.borrowPeriod as FormGroup)
    return bp.controls
  }
  // Intercept inputs property changes with ngOnChanges
  // https://angular.io/guide/component-interaction
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName in changes) {
      switch (propName) {
        case 'id':
          this.id = changes['id'].currentValue
          break;
        case 'readerId':
          this.MODE = changes['MODE'].currentValue
          break;
        default:
          break;
      }
    }
    this.initData()
  }

  initData() {
    this.isLoading = true;
    if (this.MODE == FORM_MODE.UPDATE_BOOK) {
      this.getReaders().subscribe(readers => {
        let _options = readers.map(reader => {
          return { uniqueValue: reader.id, viewValue: `${reader.name} | ${reader.email}` } as _Option
        })
        this.sharedFilteredSelectPayload = {
          options: _options,
          filterPlaceholder: "Filter by reader's name or email..",
          optionsLabel: 'Select a reader:'
        }
        this.isLoading = false;
      })
    } else if (this.MODE == FORM_MODE.UPDATE_READER) {
      this.getBooks().subscribe(books => {
        let _options = books.map(b => {
          return { uniqueValue: b.id, viewValue: b.title + ' | ' + b.isbn }
        })
        this.sharedFilteredSelectPayload = {
          options: _options,
          filterPlaceholder: "Filter by book's Title or ISBN..",
          optionsLabel: 'Select a book to borrow:'
        }
        this.isLoading = false;
      })
    }
  }

  getBooks(): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: getBooksQry,
    })
      .valueChanges
      .pipe(
        takeUntil(this._ngUnsubscribe$),
        map(res => {
          console.log(res)
          return res.data.books
        }),
        catchError((err, c) => {
          console.log(err)
          console.log(c)
          this.isLoadingFailed = true;
          return of([])
        }),
      )
  }

  getReaders(): Observable<any> {
    return this.apollo.watchQuery<any>({
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
          return of([])
        }),
      )
  }

  onSubmit() {
    // updateBook(
    //   where: { id: "10" }
    //   data: {
    //     booksToReaders: {
    //       create: [
    //         {
    //           borrowDate: "2020-05-10T00:00:00.000Z"
    //           returnDate: "2020-05-15T00:00:00.000Z"
    //           returned: false
    //           reader: { connect: { id: "1" } }
    //         }
    //       ]
    //     }
    //   }
    // ) {
    //   id
    // }

    // updateReader(
    //   where: { id: "1" }
    //   data: {
    //     booksToReaders: {
    //       create: [
    //         {
    //           borrowDate: "2020-05-10T00:00:00.000Z"
    //           returnDate: "2020-05-15T00:00:00.000Z"
    //           returned: false
    //           book:{ connect:{id:"10"}}
    //         }
    //       ]
    //     }
    //   }
    // ) {
    //   id
    // }

    if (this.formGroup.valid) {

      let bd = (new Date(this.formGroup.value.borrowPeriod.borrowDate)).toISOString()
      let rd = (new Date(this.formGroup.value.borrowPeriod.returnDate)).toISOString()

      if (this.MODE === FORM_MODE.UPDATE_BOOK) {
        let readerId = this.formGroup.value.selectedOptionId.selectedOption

        let _data = {
          booksToReaders: {
            create: [
              {
                borrowDate: bd,
                returnDate: rd,
                returned: false,
                reader: { connect: { id: readerId } }
              }
            ]
          }
        }
        this.updateBook(_data)


      } else if (this.MODE === FORM_MODE.UPDATE_READER) {
        let bookId = this.formGroup.value.selectedOptionId.selectedOption

        let _data = {
          booksToReaders: {
            create: [
              {
                borrowDate: bd,
                returnDate: rd,
                returned: false,
                book: { connect: { id: bookId } }

              }
            ]
          }
        }

        this.updateReader(_data)

      }
      this.hideBTRform()
    }



  }


  // resetForm(event?) {
  //   // since the cancel button is inside the <form> -tag, Angular will mark the form as submitted, to prevent triggering the validatio, either move the cancel-button out of the <form> -tag OR add the preventDefault() in cancel()  
  //   event?.preventDefault()
  //   //---------------------------------------------------

  //   this.formGroup.reset({
  //     borrowDate: '',
  //     returnDate: '',
  //     selectedOptionId: {selectedOption:''} , // this line will trigger an event that calls the childComponent's "function writeValue(val: any)"
  //   })

  //   this.formGroup.markAsPristine()
  //   this.formGroup.markAsUntouched();
  //   this.formGroup.updateValueAndValidity();
  // }

  updateBook(_data): void {
    console.log("*******************updateBook*******************")
    // updateBook(
    //   where: { id: "10" }
    //   data: {
    //     booksToReaders: {
    //       create: [
    //         {
    //           borrowDate: "2020-05-10T00:00:00.000Z"
    //           returnDate: "2020-05-15T00:00:00.000Z"
    //           returned: false
    //           reader: { connect: { id: "1" } }
    //         }
    //       ]
    //     }
    //   }
    // ) {
    //   id
    // }


    this.apollo.mutate({
      mutation: updateBookMut,
      variables: { id: this.id, data: _data },
      refetchQueries: [{
        query: getBookByIDQry,
        variables: { id: this.id },
      }],

    })
      .pipe(
        takeUntil(this._ngUnsubscribe$),
        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of({})
        }),

      ).subscribe((id) => {
        console.log(id)
      })
  }

  updateReader(_data): void {
    console.log("*******************updateReader*******************")
    this.apollo.mutate({
      mutation: updateReaderMut,
      variables: { id: this.id, data: _data },
      refetchQueries: [{
        query: getReaderByIDQry,
        variables: { id: this.id },
      }],

    })
      .pipe(
        takeUntil(this._ngUnsubscribe$),
        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of({})
        }),
      ).subscribe((id) => {
        console.log(id)
      })
  }


  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }

}

export enum FORM_MODE {
  UPDATE_BOOK = 0,
  UPDATE_READER = 1
}



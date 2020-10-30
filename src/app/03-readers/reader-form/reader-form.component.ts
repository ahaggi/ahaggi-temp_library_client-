import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';


import { SharedSelectComponent, SharedSelectOption, SharedSelectOptionPayload } from 'src/app/0-shared-components/shared-select/shared-select.component';
import { getBooksQry, getReaderByEmailQry, getReaderByIDQry, getReadersQry } from 'src/app/util/queriesDef';
import { FORM_MODE, ImgCategory, loadImageFromStorage } from 'src/app/util/util';
import { MyValidators } from 'src/app/util/_Validators';
import { postReaderMut, updateReaderMut } from 'src/app/util/mutationsDef';

@Component({
  selector: 'app-reader-form',
  templateUrl: './reader-form.component.html',
  styleUrls: ['./reader-form.component.css']
})
export class ReaderFormComponent implements OnInit {

  MODE: FORM_MODE;
  readerId: string;

  isLoading: boolean = false;
  isLoadingFailed: boolean = false;

  // Holds the values which presented in the html
  formGroup: FormGroup;

  // Holds the DB values to be edited 
  readerToEdit: _Reader;

  submitLabel: string = "";

  booksSelectOptionPayLoad: SharedSelectOptionPayload;

  @ViewChild(SharedSelectComponent)
  private booksSelectComponent: SharedSelectComponent;

  constructor(private apollo: Apollo, private formBuilder: FormBuilder, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    this.readerId = this.route.snapshot.paramMap.get('id');
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email],], // [MyValidators.isNotRegisteredEmailValidator]OBS async validators
      imgUri: [''],
      allBooks: this.formBuilder.array([])
    });
    this.initData()

  }

  initData() {
    this.isLoading = true;

    if (this.readerId) {
      this.MODE = FORM_MODE.EDIT
      this.submitLabel = "Edit Reader";
      this.getReaderToUpdate().subscribe((_reader) => {
        this.readerToEdit = {
          id: _reader.id,
          name: _reader.name,
          email: _reader.email,
          imgUri: loadImageFromStorage(_reader?.imgUri, ImgCategory.PERSON),
          booksToReaders: _reader.booksToReaders,
        }

        this.isLoading = false;

        // NOTE: booksToReaders and id: will be ignored inside "patchValue()", since they don't have a correspondent FormControl
        this.formGroup.patchValue(this.readerToEdit)
        this.setAsyncValidationOnEmail()

        this.getlistOfAllBooks().subscribe((books) => {
          this.createSharedSelectOptions(books)
        })
      })
    } else {
      this.MODE = FORM_MODE.CREATE
      this.submitLabel = "Submit";
      this.setAsyncValidationOnEmail()

      this.getlistOfAllBooks().subscribe((books) => {
        this.isLoading = false;
        this.createSharedSelectOptions(books)
      })
    }

  }

  setAsyncValidationOnEmail() {
    let emailController = this.formGroup.get('email')
    emailController.setAsyncValidators([MyValidators.emailAlreadyRegisteredValidator(
      // this.readerToEdit?.email         will be '' if  this.MODE != FORM_MODE.EDIT
      { errMsg: 'This email is already registered!', apollo: this.apollo, exceptValue: ((this.readerToEdit?.email) || ''), query: getReaderByEmailQry }
    )])
    emailController.updateValueAndValidity()
  }


  getReaderToUpdate(): Observable<any> {
    return this.apollo.watchQuery<_Reader>({
      variables: { id: this.readerId },
      query: getReaderByIDQry,
    })
      .valueChanges
      .pipe(
        takeUntil(this._ngUnsubscribe$),

        map((res: any) => res.data.reader),
        catchError((err, c) => {
          this.isLoadingFailed = true;
          console.log(err)
          console.log(c)
          return of({})
        })
      )
  }


  checkIfEmailIsRegistered = () => {
    // edit not exist (all - this editor)
    // create check that not exist
    return this.apollo.watchQuery<_Reader>({
      variables: { email: this.formGroup.value.email.value },
      query: getReaderByEmailQry,
    })
      .valueChanges
      .pipe(
        map((res: any) => res?.data?.reader?.id),
      )
  }

  getlistOfAllBooks(): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: getBooksQry,
    })
      .valueChanges
      .pipe(
        takeUntil(this._ngUnsubscribe$),
        map((res: any) => res.data.books),
        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of([])
        }),
      )
  }

  createSharedSelectOptions(_books): void {
    let _borrowedBooksIds = this.readerToEdit?.booksToReaders?.map((_btr) => _btr.book?.id) || []
    let allBooksFormArray: FormArray = this.formGroup.get('allBooks') as FormArray
    let _list = _books.map(book => {
      let isBorrowed: boolean = _borrowedBooksIds.indexOf(book?.id) !== -1
      let fc = new FormControl(isBorrowed)
      allBooksFormArray.push(fc)
      let option: SharedSelectOption = {
        uniqueValue: book?.id,
        viewValue: { fst: book?.title, snd: book?.description },
        formControllerBoolean: fc
      }
      return option
    })

    this.booksSelectOptionPayLoad = {
      parentForm: this.formGroup,
      formArray: allBooksFormArray,
      list: _list
    }
  }

  onSubmit() {
    if (this.formGroup.valid) {
      // let _booksToReaders = this.computeBooksToReadersStatus()
      let reader = {
        name: this.formGroup.value.name,
        email: this.formGroup.value.email,
        about: this.formGroup.value.about,
        // booksToReaders: _booksToReaders
      }

      if (this.MODE === FORM_MODE.EDIT) {
        this.updateReader(reader)
      } else {
        this.postReader(reader)
      }
      this.goBack();
    }
  }

  postReader(data): void {
    console.log("*******************postReader*******************")
    this.apollo.mutate({
      mutation: postReaderMut,
      variables: { data: data },
      refetchQueries: [{
        query: getReadersQry
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
      variables: { id: this.readerId, data: _data },
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

  goBack() {
    this.formGroup.disable()
    this.formGroup.reset() // important to prevent canDeactivate guarde from showing a msg.
    this.location.back();

  }

  // computeBooksToReadersStatus() {
  //   // selectedBooksID: this is the list of books' ids that has been borrowed by this reader
  //   // this.readerToEdit will be null in create mode.
  //   // this.readerToEdit.BooksToReaders: this's the state of BooksToReaders in the db which means this is the edit mode
  //   // this.readerToEdit.BooksToReaders has the flwg structure:
  //   //                                                     BooksToReaders:{
  //   //                                                      id:"BooksToReadersID"
  //   //                                                      borrowDate 
  //   //                                                      returnDate
  //   //                                                      returned
  //   //                                                      book:{
  //   //                                                         id:"bookID"
  //   //                                                         title:"qwe"
  //   //                                                         ...
  //   //                                                      }
  //   //                                                     }
  //   // if create mode => there's no books' list to edit, but only to add
  //   let _booksToReaders: any[] = this.readerToEdit?.booksToReaders || []
  //   let borrowedBooksIDsBeforeEdit = _booksToReaders.map(({ book: { id } }) => id)

  //   let selectedBooksID: string[] = this.booksSelectComponent?.getSelectedOptions().map(selectOption => selectOption.uniqueValue) || []

  //   // let booksIdToConnect = selectedBooksID - borrowedBooksIDsBeforeEdit
  //   let booksIdToConnect = selectedBooksID.filter(id => !borrowedBooksIDsBeforeEdit.includes(id))
  //   let booksToReadersIdsToCreate = booksIdToConnect.map(id => { return { book: { connect: { id: id } } } })

  //   let res = { create: booksToReadersIdsToCreate }

  //   if (this.MODE == FORM_MODE.EDIT) {
  //     // let booksToReadersIDsToDelete = (this.readerToEdit._booksToReaders.bookId) - selectedBooksID
  //     let booksToReadersIDsToDelete = (_booksToReaders.filter(({ book: { id: bookId } }) => !selectedBooksID.includes(bookId))).map(({ id }) => id)
  //     let booksToReadersToDelete = booksToReadersIDsToDelete.map(btrId => { return { id: btrId } })
  //     // res = { create: booksToReadersIdsToCreate, delete: booksToReadersToDelete }
  //     res['delete'] = booksToReadersToDelete
  //   }
  //   return res;
  // }

  canDeactivate() {
    if (!this.formGroup.pristine)
      return window.confirm('Discard changes?');
    return true;
  }

  private _ngUnsubscribe$: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }
}

type _Reader = {
  id: string;
  name: string;
  email: string;
  imgUri: string;
  booksToReaders: any[];
}
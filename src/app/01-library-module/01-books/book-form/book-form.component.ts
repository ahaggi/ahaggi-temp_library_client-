
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';

import gql from 'graphql-tag';
import { Observable, of, Subject } from 'rxjs';

import { catchError, debounceTime, delay, distinctUntilChanged, first, flatMap, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { FORM_MODE, generateFakeISBN, ImgCategory, loadImageFromStorage } from '../../../util/util';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SharedListSelectComponent, SlsOption, SlsPayload } from '../../00-shared-components/shared-list-select/shared-list-select.component';
import { getAuthorsQry, getBookByIDQry, getBookByIsbnQry, getBooksQry } from '../../../util/gqlUtil/queriesDef';
import { postBookMut, updateBookMut } from '../../../util/gqlUtil/mutationsDef';
import { MyValidators } from '../../../util/_validators';


@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {

  MODE: FORM_MODE;
  bookId: string;

  isLoading: boolean = false;
  isLoadingFailed: boolean = false;

  // Holds the values which presented in the html
  formGroup: FormGroup;

  // Holds the DB values to be edited 
  bookToEdit: _Book;
  submitLabel: string = "";

  authorsSlsPayload: SlsPayload;

  @ViewChild(SharedListSelectComponent)
  private authorsSelectComponent: SharedListSelectComponent;

  constructor(private apollo: Apollo, private formBuilder: FormBuilder, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {


    this.bookId = this.route.snapshot.paramMap.get('id');



    this.formGroup = this.formBuilder.group({
      title: ['', Validators.required],
      isbn: ['', Validators.required],
      pages: ['', [Validators.required, Validators.pattern('\\d+')]],
      chapters: ['', [Validators.required, Validators.pattern('\\d+')]],
      price: ['', [Validators.required, Validators.pattern('\\d*(\\.)?\\d*')]],
      description: ['', Validators.required],
      storage: this.formBuilder.group({
        quantity: ['', [Validators.required, Validators.pattern('\\d+')]],
        // DISABLED fields: to get the value of the disabled controller, 
        // use this.formGroup.get('controllerName').value , and NOT this.formGroup.value.controllerName
        borrowedQuantity: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('\\d+')]],
      }),
      allAuthors: this.formBuilder.array([], MyValidators.requiredToSelectSomeValidator({ errMsg: "This book has to have at least one author.\nPlease select from the above list." }))
      // opt-out of creating a controller for the booksToAuthors/booksToReaders, since its not necessary
      // booksToAuthors:this.formBuilder.array([
      //   this.formBuilder.group({
      //     id: [0, Validators.required],
      //     author: this.formBuilder.group({
      //       id: [0, Validators.required],
      //       name: ["", Validators.required],
      //       about: ["", Validators.required],
      //     })
      //   })
      // ])
      // booksToReaders: [],
      // imgUri: [''],
    });
    this.initData()
  }


  initData() {
    this.isLoading = true;

    if (this.bookId) {
      this.MODE = FORM_MODE.EDIT
      this.submitLabel = "Edit Book";
      this.getBookToUpdate().subscribe((_b) => {
        this.bookToEdit = {
          id: _b.id,
          title: _b.title,
          isbn: _b.isbn,
          pages: _b.pages,
          chapters: _b.chapters,
          price: _b.price,
          description: _b.description,
          imgUri: loadImageFromStorage(_b?.imgUri, ImgCategory.BOOK),
          storage: _b.storage,
          booksToAuthors: _b.booksToAuthors
        }

        this.isLoading = false;

        // NOTE: booksToAuthors, booksToReaders and id: will be ignored inside "patchValue()", since they don't have a correspondent FormControl
        this.formGroup.patchValue(this.bookToEdit)

        this.getlistOfAllAuthors().subscribe((auths) => {
          this.createSharedSelectOptions(auths)
        })
      })
    } else {
      this.MODE = FORM_MODE.CREATE
      this.submitLabel = "Submit";

      this.getlistOfAllAuthors().subscribe((auths) => {
        this.isLoading = false;

        this.createSharedSelectOptions(auths)
      })
    }

  }

  getBookToUpdate(): Observable<any> {
    return this.apollo.watchQuery<_Book>({
      variables: { id: this.bookId },
      query: getBookByIDQry,
    })
      .valueChanges
      .pipe(
        takeUntil(this._ngUnsubscribe$),

        map((res: any) => res.data.book),
        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of({})
        })
      )
  }

  getlistOfAllAuthors(): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: getAuthorsQry,
    })
      .valueChanges
      .pipe(
        takeUntil(this._ngUnsubscribe$),

        map((res: any) => res.data.authors),

        catchError((err, c) => {
          console.log(err)
          console.log(c)
          return of([])
        }),
      )
  }

  createSharedSelectOptions(_authors): void {
    // _authorsIdOfThisBook = []  iff   this.bookToEdit==null
    let _authorsIdOfThisBook = this.bookToEdit?.booksToAuthors?.map((_bta) => _bta.author?.id) || []

    let allAuthorsFormArray: FormArray = this.formGroup.get('allAuthors') as FormArray


    let _list = _authors.map(auth => {
      let isThisBookAuth: boolean = _authorsIdOfThisBook.indexOf(auth?.id) !== -1

      let fc = new FormControl(isThisBookAuth)
      allAuthorsFormArray.push(fc)

      let option: SlsOption = {
        uniqueValue: auth?.id,
        viewValue: { fst: auth?.email, snd: auth?.name },
        formControllerBoolean: fc
      }

      return option
    })

    this.authorsSlsPayload = {
      title: "Authors:",
      parentForm: this.formGroup,
      formArray: allAuthorsFormArray,
      list: _list,
      msgToDispaly: "This book has to have at least one author"
    }

  }

  mockSubmit() {
    this.genAndCheckISBN$().subscribe(isbn => {

      let book = {
        // cast to number
        pages: 1,
        chapters: 1,
        price: 1,
        // string values
        title: "1",
        isbn: isbn,
        description: this.formGroup.value.description,
        // Aggregated values
        storage: {
          create: {
            quantity: 1,
            borrowedQuantity: 0
          }
        },
        booksToAuthors: {
          create: {
            author: {
              connect: {
                id: "1"
              }
            }
          }
        }
      }

      this.generatingISBN = false
      this.postBook(book)
      this.goBack();

    })


  }
  onSubmit() {
    // due to the diffrent "mutation sturcture" for the update and post, we have to pre-compute the data sturcture for booksToAuthors and storage. 

    if (this.formGroup.valid) {
      let _booksToAuthors = this.computeBooksToAuthorsStatus()
      let _storage = this.computeStorageStatus()


      let book = {
        // cast to number
        pages: +(this.formGroup.value.pages),
        chapters: +(this.formGroup.value.chapters),
        price: +(this.formGroup.value.price),
        // string values
        title: this.formGroup.value.title,
        isbn: this.formGroup.value.isbn,
        description: this.formGroup.value.description,
        // Aggregated values
        storage: _storage,
        booksToAuthors: _booksToAuthors
      }

      if (this.MODE === FORM_MODE.EDIT) {
        this.updateBook(book)
      } else {
        this.postBook(book)
      }

      this.goBack();



    }



  }
  goBack() {
    this.formGroup.disable()
    this.formGroup.reset() // important to prevent canDeactivate guarde from showing a msg.
    this.location.back();

  }

  postBook(book): void {
    console.log("*******************postBook*******************")

    this.apollo.mutate({
      mutation: postBookMut,
      variables: { data: book },
 
      update: (store, resp: any) => {
        let createdBook: any = resp?.data?.createBook
        console.log("###################################")
        console.log("###################################")
        console.log(resp)
        console.log("###################################")

        this.updateStoreAfterCreateBook({ store, createdBook })
      }
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

  updateBook(_data): void {
    console.log("*******************updateBook*******************")

    // updateBook(
    //   where: { id: "2" }
    //   data: {
    //     isbn: "1-2-34"
    //     title: "q"
    //     pages: 2
    //     ...
    //     storage:{update:{quantity:5 }}
    //
    //     booksToAuthors: {
    //       create: [
    //         { author: { connect: { id: "authorID" } } }
    //         { author: { connect: { id: "authorID" } } }
    //       ]
    //       delete: [
    //         { id: "booksToAuthorsID" }
    //         { id: "booksToAuthorsID" }
    //         { id: "booksToAuthorsID" }
    //       ]
    //     }
    //   }
    // ) {
    //   id
    // }

    this.apollo.mutate({
      mutation: updateBookMut,
      variables: { id: this.bookId, data: _data },

      
      update: (store, resp: any) => {
        let updatedBook: any = resp?.data?.updateBook

        this.updateStoreAfterUpdateBook({ store, _updatedBook: updatedBook })
      }

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

  updateStoreAfterUpdateBook({ store, _updatedBook }) {
    
    try {
      // 1- Read the data as stored in the cache
      // OBS readQuery will never make a request to your GraphQL server, and it will throw an error if the data is not in your cache. 
      const dataFromStore = store.readQuery({
        query: getBookByIDQry,
        variables: { id: _updatedBook.id },
      });

      // 2- mutate the data
      const updatedBook = {...dataFromStore.book , ..._updatedBook}

      // 3- update the cache with the updated data
      store.writeQuery({
        query: getBookByIDQry,
        variables: { id: updatedBook.id },
        data: { book: updatedBook }
      });
    }
    catch (err) {
      console.error(err)
    }

  }

  updateStoreAfterCreateBook({ store, createdBook }) {

    try {
      // 1- Read the data as stored in the cache
      // OBS readQuery will never make a request to your GraphQL server, and it will throw an error if the data is not in your cache. 
      const dataFromStore = store.readQuery({ query: getBooksQry, });

      // 2- mutate the data
      const temp = [...dataFromStore.books, createdBook]

      // 3- update the cache with the updated data
      store.writeQuery({ query: getBooksQry, data: { books: temp } });
    }
    catch (err) {
      console.error(err)
    }

  }

  computeBooksToAuthorsStatus() {

    // selectedAuthsID: this is the list of authors' ids that has been choosed by the user
    // this.bookToEdit will be null in create mode.
    // this.bookToEdit.booksToAuthors: this the state of booksToAuthors (iff exist) in the db which means this is the edit mode
    // this.bookToEdit.booksToAuthors has the flwg structure:
    //                                                     booksToAuthors:{
    //                                                      id:"booksToAuthorsID"
    //                                                       author:{
    //                                                         id:"authorID"
    //                                                         name:"qwe"
    //                                                         ...
    //                                                      }
    //                                                     }

    // if create mode => there's no authors' list to edit only to add
    let _booksToAuthors: any[] = this.bookToEdit?.booksToAuthors || []

    let selectedAuthsID: string[] = this.authorsSelectComponent?.getSelectedOptions().map(selectOption => selectOption.uniqueValue) || []

    let authsIDsBeforeEdit = _booksToAuthors.map(({ author: { id } }) => id)
    // let authsIdToConnect = selectedAuthsID - authsIDsBeforeEdit
    let authsIdToConnect = selectedAuthsID.filter(id => !authsIDsBeforeEdit.includes(id))
    let bookToAuthsIdsToCreate = authsIdToConnect.map(id => { return { author: { connect: { id: id } } } })

    // let bookToAuthsIDsToDelete = (this.bookToEdit.booksToAuthors.authId) - selectedAuthsID
    let bookToAuthsIDsToDelete = (_booksToAuthors.filter(({ author: { id: authId } }) => !selectedAuthsID.includes(authId))).map(({ id }) => id)
    let bookToAuthsToDelete = bookToAuthsIDsToDelete.map(btaId => { return { id: btaId } })

    let toUpdate = { create: bookToAuthsIdsToCreate, 'delete': bookToAuthsToDelete }
    let toCreate = { create: bookToAuthsIdsToCreate }

    return (this.MODE == FORM_MODE.EDIT) ? toUpdate : toCreate;
  }

  computeStorageStatus() {
    // storage:{update:{quantity:2 }}
    // storage:{create:{quantity:2 , borrowedQuantity:0  }}

    let _qty = +(this.formGroup.value.storage.quantity)

    // notice the handling of the disabled controller borrowedQuantity
    let _bQty = +(this.formGroup.get("storage").get("borrowedQuantity").value)

    let toUpdate = { update: { quantity: _qty } }
    let toCreate = { create: { quantity: _qty, borrowedQuantity: _bQty } }

    return (this.MODE == FORM_MODE.EDIT) ? toUpdate : toCreate;
  }


  genAndCheckISBN$ = () => {
    return of(generateFakeISBN())
      .pipe(
        takeUntil(this._ngUnsubscribe$),
        delay(750),
        flatMap((isbn) => this.checkIsbnNotExist$(isbn)),
        flatMap(validity => {
          if (validity.notExist)
            return of(validity.isbn)
          else
            return this.genAndCheckISBN$()
        })
      )
  }

  checkIsbnNotExist$ = (_isbn) => {
    return this.apollo.watchQuery<_Book>({
      variables: { isbn: _isbn },
      query: getBookByIsbnQry,
    }).valueChanges
      .pipe(
        takeUntil(this._ngUnsubscribe$),
        map((res: any) => {
          if (res.data.book?.id == null)
            return { notExist: true, isbn: _isbn }
          else
            return { notExist: false }
        }),
        first() // NOTE: We have to use first here becuase apollo.watchQuery is like Subject that emits but does not complete,, "open-stream"-ish
        // catchError((err, c) => {
        //   console.log(err)
        //   console.log(c)
        //   // return of({notExist: false})
        // })
      )
  }



  generatingISBN: boolean = false
  scanISBN() {
    this.generatingISBN = true
    this.genAndCheckISBN$().subscribe(isbn => {
      let _isbnController = this.formGroup.controls.isbn;
      _isbnController.setValue(isbn)
      _isbnController.markAsDirty()
      this.generatingISBN = false
    })
  }

  get allFormControls() {
    return this.formGroup.controls;
  }


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





export type _Book = {
  id: string;
  title: string;
  isbn: string;
  pages: number;
  chapters: number;
  price: number;
  description: string;
  storage: any;
  booksToAuthors: any[];
  // booksToReaders: any[];
  imgUri: string;
}






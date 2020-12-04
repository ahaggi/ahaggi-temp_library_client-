import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';



import { SharedListSelectComponent, SlsOption, SlsPayload } from '../../00-shared-components/shared-list-select/shared-list-select.component';
import { postAuthorMut, updateAuthorMut } from '../../../util/gqlUtil/mutationsDef';
import { getAuthorByEmailQry, getAuthorByIDQry, getAuthorsQry, getBooksQry } from '../../../util/gqlUtil/queriesDef';
import { FORM_MODE, ImgCategory, loadImageFromStorage } from '../../../util/util';
import { MyValidators } from '../../../util/_validators';

@Component({
  selector: 'app-author-form',
  templateUrl: './author-form.component.html',
  styleUrls: ['./author-form.component.css']
})
export class AuthorFormComponent implements OnInit {

  MODE: FORM_MODE;
  authorId: string;

  isLoading: boolean = false;
  isLoadingFailed: boolean = false;

  // Holds the values which presented in the html
  formGroup: FormGroup;

  // Holds the DB values to be edited 
  authorToEdit: _Author;

  submitLabel: string = "";

  booksSlsPayLoad: SlsPayload;

  @ViewChild(SharedListSelectComponent)
  private booksSelectComponent: SharedListSelectComponent;

  constructor(private apollo: Apollo, private formBuilder: FormBuilder, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    this.authorId = this.route.snapshot.paramMap.get('id');



    this.formGroup = this.formBuilder.group({

      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],

      about: ['', Validators.required],

      // imgUri: [''],
      allBooks: this.formBuilder.array([])
    });
    this.initData()

  }

  initData() {
    this.isLoading = true;

    if (this.authorId) {
      this.MODE = FORM_MODE.EDIT
      this.submitLabel = "Edit Author";
      this.getAuthorToUpdate().subscribe((_author) => {
        this.authorToEdit = {
          id: _author.id,
          name: _author.name,
          email: _author.email,
          about: _author.about,
          imgUri: loadImageFromStorage(_author?.imgUri, ImgCategory.PERSON),
          booksToAuthors: _author.booksToAuthors,
        }

        this.isLoading = false;

        // NOTE: booksToAuthors, booksToReaders and id: will be ignored inside "patchValue()", since they don't have a correspondent FormControl
        this.formGroup.patchValue(this.authorToEdit)
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
      // this.authorToEdit?.email         will be '' if  this.MODE != FORM_MODE.EDIT
      { errMsg: 'This email is already registered!', apollo: this.apollo, exceptValue: ((this.authorToEdit?.email) || ''), query: getAuthorByEmailQry }
    )])
    emailController.updateValueAndValidity()
  }
  getAuthorToUpdate(): Observable<any> {
    return this.apollo.watchQuery<_Author>({
      variables: { id: this.authorId },
      query: getAuthorByIDQry,
    })
      .valueChanges
      .pipe(
        takeUntil(this._ngUnsubscribe$),

        map((res: any) => res.data.author),
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
    // create check that not exist              "a@a.com"
    return this.apollo.watchQuery<_Author>({
      variables: { email: this.formGroup.value.email.value },
      query: getAuthorByEmailQry,
    })
      .valueChanges
      .pipe(
        map((res: any) => res?.data?.author?.id != null),

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
    let _booksIdOfThisAuthor = this.authorToEdit?.booksToAuthors?.map((_bta) => _bta.book?.id) || []
    let allBooksFormArray: FormArray = this.formGroup.get('allBooks') as FormArray
    let _list = _books.map(book => {
      let isThisBookAuth: boolean = _booksIdOfThisAuthor.indexOf(book?.id) !== -1
      let fc = new FormControl(isThisBookAuth)
      allBooksFormArray.push(fc)
      let option: SlsOption = {
        uniqueValue: book?.id,
        viewValue: { fst: book?.title, snd: book?.isbn },
        formControllerBoolean: fc
      }
      return option
    })

    this.booksSlsPayLoad = {
      parentForm: this.formGroup,
      formArray: allBooksFormArray,
      list: _list,
      title: "Published Books:",
      msgToDispaly: "Choose which books have been published by this author.",
      filterInputPlaceholder: "Filter by book's Title or ISBN"

    }
  }

  onSubmit() {
    if (this.formGroup.valid) {
      let _booksToAuthors = this.computeBooksToAuthorsStatus()
      let auhtor = {
        name: this.formGroup.value.name,
        email: this.formGroup.value.email,
        about: this.formGroup.value.about,
        booksToAuthors: _booksToAuthors
      }

      if (this.MODE === FORM_MODE.EDIT) {
        this.updateAuthor(auhtor)
      } else {
        this.postAuthor(auhtor)
      }
      this.goBack();
    }
  }

  postAuthor(data): void {
    console.log("*******************postAuthor*******************")
    this.apollo.mutate({
      mutation: postAuthorMut,
      variables: { data: data },

      refetchQueries: [{
        query: getAuthorsQry
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

  updateAuthor(_data): void {
    console.log("*******************updateAuthor*******************")
    this.apollo.mutate({
      mutation: updateAuthorMut,
      variables: { id: this.authorId, data: _data },
      refetchQueries: [{
        query: getAuthorByIDQry,
        variables: { id: this.authorId },
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

  goBack() {
    this.formGroup.disable()
    this.formGroup.reset() // important to prevent canDeactivate guarde from showing a msg.
    this.location.back();

  }

  computeBooksToAuthorsStatus() {

    // selectedAuthsID: this is the list of books' ids that has been published by this author
    // this.authorToEdit will be null in create mode.
    // this.authorToEdit.booksToAuthors: this the state of booksToAuthors in the db which means this is the edit mode
    // this.authorToEdit.booksToAuthors has the flwg structure:
    //                                                     booksToAuthors:{
    //                                                      id:"booksToAuthorsID"
    //                                                       book:{
    //                                                         id:"bookID"
    //                                                         title:"qwe"
    //                                                         ...
    //                                                      }
    //                                                     }

    // if create mode => there's no books' list to edit, but only to add
    let _booksToAuthors: any[] = this.authorToEdit?.booksToAuthors || []
    let booksIDsBeforeEdit = _booksToAuthors.map(({ book: { id } }) => id)

    let selectedBooksID: string[] = this.booksSelectComponent?.getSelectedOptions().map(selectOption => selectOption.uniqueValue) || []

    // let booksIdToConnect = selectedBooksID - booksIDsBeforeEdit
    let booksIdToConnect = selectedBooksID.filter(id => !booksIDsBeforeEdit.includes(id))
    let bookToAuthsIdsToCreate = booksIdToConnect.map(id => { return { book: { connect: { id: id } } } })

    let res = { create: bookToAuthsIdsToCreate }

    if (this.MODE == FORM_MODE.EDIT) {
      // let bookToAuthsIDsToDelete = (this.authorToEdit.booksToAuthors.bookId) - selectedBooksID
      let bookToAuthsIDsToDelete = (_booksToAuthors.filter(({ book: { id: bookId } }) => !selectedBooksID.includes(bookId))).map(({ id }) => id)
      let bookToAuthsToDelete = bookToAuthsIDsToDelete.map(btaId => { return { id: btaId } })
      // res = { create: bookToAuthsIdsToCreate, delete: bookToAuthsToDelete }
      res['delete'] = bookToAuthsToDelete
    }

    return res;
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

type _Author = {
  id: string;
  name: string;
  email: string;
  about: string;
  imgUri: string;
  booksToAuthors: any[];
}

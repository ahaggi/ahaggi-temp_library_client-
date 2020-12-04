import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';


import {  getReaderByEmailQry, getReaderByIDQry, getReadersQry } from '../../../util/gqlUtil/queriesDef';
import { FORM_MODE, ImgCategory, loadImageFromStorage } from '../../../util/util';
import { MyValidators } from '../../../util/_validators';
import { postReaderMut, updateReaderMut } from '../../../util/gqlUtil/mutationsDef';

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

  constructor(private apollo: Apollo, private formBuilder: FormBuilder, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    this.readerId = this.route.snapshot.paramMap.get('id');
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email],], // [MyValidators.isNotRegisteredEmailValidator]OBS async validators
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('\\d{8}')]],
      imgUri: [''],

    });
    this.initData()

  }

  initData() {
    if (this.readerId) {
      this.isLoading = true;
      this.MODE = FORM_MODE.EDIT
      this.submitLabel = "Edit Reader";
      this.getReaderToUpdate().subscribe((_reader) => {
        this.readerToEdit = {
          id: _reader.id,
          name: _reader.name,
          email: _reader.email,
          address: _reader.address,
          phone: _reader.phone,

          imgUri: loadImageFromStorage(_reader?.imgUri, ImgCategory.PERSON),
          booksToReaders: _reader.booksToReaders,
        }

        this.isLoading = false;

        // NOTE: booksToReaders and id: will be ignored inside "patchValue()", since they don't have a correspondent FormControl
        this.formGroup.patchValue(this.readerToEdit)
        this.setAsyncValidationOnEmail()
      })
    } else {
      this.MODE = FORM_MODE.CREATE
      this.submitLabel = "Submit";
      this.setAsyncValidationOnEmail()
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





  onSubmit() {
    if (this.formGroup.valid) {

      let reader = {
        name: this.formGroup.value.name,
        email: this.formGroup.value.email,
        address: this.formGroup.value.address,
        phone: (this.formGroup.value.phone),
      }

      if (this.MODE === FORM_MODE.EDIT) {
        this.updateReader(reader)
      } else {
        this.postReader(reader)
      }
      this.goBack();
    }
  }

  postReader(reader): void {

    console.log("*******************postReader*******************")

    this.apollo.mutate({
      mutation: postReaderMut,
      variables: { data: reader },
      refetchQueries: [{
        query: getReadersQry,
        variables: { id: reader.id },
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

  updateReader(reader): void {
    console.log("*******************updateReader*******************")

    console.log(reader)

    this.apollo.mutate({
      mutation: updateReaderMut,
      variables: { id: this.readerId, data: reader },
      refetchQueries: [{
        query: getReaderByIDQry,
        variables: { id: this.readerId },
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
  address: string;
  phone: string;
  imgUri: string;
  booksToReaders: any[];
}
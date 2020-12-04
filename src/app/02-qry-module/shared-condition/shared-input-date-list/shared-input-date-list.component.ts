import { Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
//************* CVA **************************
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormGroupDirective, NgForm, } from "@angular/forms";
//--------------------------------------------
import { InputField, CacheType, InputValueType } from '../../form/input-field.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { takeUntil } from 'rxjs/operators';
import { SCUtil } from '../SCUtil';




@Component({
  selector: 'app-shared-input-date-list',
  templateUrl: './shared-input-date-list.component.html',
  styleUrls: ['./shared-input-date-list.component.css']
  ,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedInputDateListComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SharedInputDateListComponent),
      multi: true
    }
  ]
})
export class SharedInputDateListComponent implements OnInit {
  @Input()
  condition: string;

  @Input()
  field: InputField;

  private termsListChanges: Subject<string[]> = new Subject<string[]>();
  terms: string[] = []

  //used just to validate the input!
  termController: FormControl;



  constructor() { }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  // Just to validate mat-chiplist
  @ViewChild("chipList") chipList: MatChipList;
  errorMatcher: MyErrorStateMatcher;

  ngOnInit(): void {
    let datePatternValidator = SCUtil.getDatePatternValidator(this.condition || ' ')

    this.termController = new FormControl([], [this._requiredValidator() , datePatternValidator])

    this.termsListChanges.pipe(
      takeUntil(this._ngUnsubscribe$)
    ).subscribe((elms) => {

      // since there is a diff date format between the UI and the db, we need to reformat the inputs before sending it in qry to the db
      let formatDateElms = elms.map(v=> this.formatDate(v) )

      this.onChange && this.onChange(formatDateElms);
      this.field.cache[CacheType.LIST] = elms;
      console.log(" %%%%%%%%%%%%%%%%%   %%%% SharedInputDateListComponent termsListChanges %%%%   %%%%%%%%%%%%%%%%%")
    })

    this.termController.statusChanges.subscribe(
      status => this.chipList.errorState = status === 'INVALID'
    );
    this.errorMatcher = new MyErrorStateMatcher()


  }


  ngAfterViewInit(): void {
    // In case of the user changes the condition in shared-condition.component OR unselect/select a field, the 
    // prev saved value inside the cache (IF EXISTS) should propegate and update the value and validity of its ancestors
    // example:
    /*
     * formGroup{
     *    title:{
     *      in: ["123" , "456"]
     *    }
     * }
     * 
     * After changing the condition "contains" to be "equals", the formGroup of QryFormComponent should look like the flwg:
     * 
     * formGroup{
     *    title:{
     *      notIn: ["123" , "456"]
     *    }
     * }
     */
    let prevCachedValue: any[] = this.field.cache[CacheType.LIST];
    if (prevCachedValue != null && prevCachedValue.length > 0) {
      this.terms = prevCachedValue;
      this.termsListChanges.next(this.terms)
    }
  }

  add(event: MatChipInputEvent): void {
    // const input = event.input;
    // const value = event.value;

    // // Add term
    // if ((value || "").trim()) {
    //   this.terms.push(value);
    //   this.termsListChanges.next(this.terms)
    // }

    // // Reset the input value
    // if (input)
    //   input.value = "";

    const value = this.termController.value || "";

    // Add term
    if (value.length > 0 && this.termController.valid) {

      this.terms.push(value);
      this.termsListChanges.next(this.terms)

      // Reset the input value
      this.termController.setValue('');
    }

  }

  remove(term: string): void {
    const index = this.terms.indexOf(term);

    if (index >= 0) {
      this.terms.splice(index, 1);
      this.termsListChanges.next(this.terms)
      if (this.terms.length == 0)
        this.termController.updateValueAndValidity()
    }
  }
  
  formatDate(input:string):string{
    // 20-01-2020       10    dilNdx 2
    // -01-2020          8    dilNdx 0
    // -01-              4    dilNdx 0
    // -2020             5    dilNdx 0

  let formatedInput = '';
  let inputTemp = input;

  if (this.termController.valid) {
    let delimiterNdx;
    switch (input.length) {

      case 10:
        delimiterNdx = 2;
        break;
      case 8:
      case 5:
      case 4: // no need
        delimiterNdx = 0;
        break;
      default:
        console.error('Invalid date length')
        break;
    }

    if (typeof delimiterNdx == 'number' && delimiterNdx >= 0) {
      let delimiter = input.charAt(delimiterNdx)
      let inputDate = input.split(delimiter)
      // to be consistent with the db data yyyy MM dd
      inputDate.reverse();
      inputTemp = inputDate.join('-')
      if (input.length == 10) {
        //since we ignored the time in this app, we add ' 00:00:00'
        let temp = new Date(inputTemp + ' 00:00:00')
        formatedInput = temp.toISOString()
      } else
        formatedInput = inputTemp
    }

    if (!formatedInput)
      console.error('err at converting the date input')

  }
  return formatedInput;
}


  _requiredValidator: () => ValidatorFn = () => {
    return (control: AbstractControl): { [key: string]: any } | null =>
      this.terms.length > 0 || control.value !== ''
        ? null : { __required: "Please enter a value or uncheck this field." };
  }

  InputValueType: typeof InputValueType = InputValueType


  //************* CVA **************************
  public onTouched: () => void = () => { };
  private onChange: Function;

  writeValue(val: any): void {
    // if (val == '' || val == null || typeof val === 'undefined') {
    //   this.terms = []
    // } else {
    //   this.terms = val
    // }
    // this.termsListChanges.next(this.terms);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate(c: AbstractControl): ValidationErrors | null {
    /* 
    This is a costum validation for the parentFormGroup.formControl, since we are using CVA to communicate with the parentFormGroup.formControl.
    To Show this errMsg go to the parent.html for example and add the flwg:
    <mat-error *ngIf="this.formGroup.controls.placeholderForTheChildFormGroup.hasError('invalidSubForm')">
        {{this.formGroup.controls.placeholderForTheChildFormGroup?.errors?.invalidSubForm?.message}}
    </mat-error>
    */
    return this.termController.valid ? null : { invalidSubForm: { valid: false, message: "SharedInputDateListComponent Err Msg" } };
  }
  //--------------------------------------------

  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    console.log("%%%%%%%%%3333%%%%%%%%ngOnDestroy SharedInputDateListComponent ngOnDestroy%%%%%%%%%3333%%%%%%%%")
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }



}
class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    let a = !!(control && control.invalid && (control.dirty || control.touched))
    return a;
  }
}

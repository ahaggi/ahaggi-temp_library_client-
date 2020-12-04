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

@Component({
  selector: 'app-qry-shared-input-list',
  templateUrl: './shared-input-list.component.html',
  styleUrls: ['./shared-input-list.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedInputListComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SharedInputListComponent),
      multi: true
    }
  ]
})
export class SharedInputListComponent implements OnInit {

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

    this.termController = new FormControl('', this.getVAlidators())

    this.termsListChanges.pipe(
      takeUntil(this._ngUnsubscribe$)
    ).subscribe((elms) => {


      this.onChange && this.onChange(elms);
      this.field.cache[CacheType.LIST] = elms;
      console.log(" %%%%%%%%%%%%%%%%%   %%%% SharedInputListComponent termsListChanges %%%%   %%%%%%%%%%%%%%%%%")
    })

    this.termController.statusChanges.subscribe(
      status => this.chipList.errorState = status === 'INVALID'
    );
    this.errorMatcher = new MyErrorStateMatcher()


  }

  getVAlidators(): ((control: AbstractControl) => ValidationErrors)[] {
    let _inputValueType = this.field.inputValueType
    let _validators: ((control: AbstractControl) => ValidationErrors)[] = []
    switch (_inputValueType) {
      case InputValueType.STRING :
        _validators = [this._requiredValidator(),]
        break;
        case  InputValueType.EMAIL:
          _validators = [this._requiredValidator(),Validators.email]
          break;
        case InputValueType.INT:
        _validators = [this._requiredValidator(), Validators.pattern('\\d+')]

        break;
      case InputValueType.FLOAT:
        _validators = [this._requiredValidator(), Validators.pattern('\\d*(\\.)?\\d*')]
        break;
      case InputValueType.PHONE:
        _validators = [this._requiredValidator(), Validators.pattern('\\d{1,8}')]
        break;
      default:
        break;
    }

    return _validators
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
      this.termController.updateValueAndValidity()

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

    // NOTE: it should be limit on the nr of elems in this.terms

    const value = this.termController.value || "";

    // Add term
    if (value.length > 0 && this.termController.valid) {
      const input = (this.field.inputValueType == InputValueType.INT ||
        this.field.inputValueType == InputValueType.FLOAT) ?
        +value :
        value;

      this.terms.push(input);
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
    return this.termController.valid ? null : { invalidSubForm: { valid: false, message: "SharedInputListComponent Err Msg" } };
  }
  //--------------------------------------------

  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    console.log("%%%%%%%%%3333%%%%%%%%ngOnDestroy SharedInputListComponent ngOnDestroy%%%%%%%%%3333%%%%%%%%")
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }



}
class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    let a = !!(control  && control.invalid && ( control.touched))
    
    return a;
  }
}

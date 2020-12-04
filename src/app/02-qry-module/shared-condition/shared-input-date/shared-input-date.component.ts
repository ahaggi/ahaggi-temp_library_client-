import { Component, forwardRef, Input, OnInit, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
//************* CVA **************************
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, Validators, AbstractControl, ValidationErrors, } from "@angular/forms";


//--------------------------------------------
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputField, CacheType, InputValueType } from '../../form/input-field.service';
import { SCUtil } from '../SCUtil';

@Component({
  selector: 'app-shared-input-date',
  templateUrl: './shared-input-date.component.html',
  styleUrls: ['./shared-input-date.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedInputDateComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SharedInputDateComponent),
      multi: true
    }
  ]

})
export class SharedInputDateComponent implements OnInit {

  @Input()
  condition: string;

  @Input()
  field: InputField;

  termController: FormControl;

  constructor() { }

  ngOnInit(): void {
    let datePatternValidator = SCUtil.getDatePatternValidator(this.condition || ' ')
    this.termController = new FormControl('', [Validators.required, datePatternValidator])

    this.termController.valueChanges.pipe(
      takeUntil(this._ngUnsubscribe$)
    ).subscribe((v: string) => {

      let formatedInput = this.formatDate(v)

      this.onChange && this.onChange(formatedInput);
      this.field.cache[CacheType.SINGLE] = v;

      console.log(" %%%%%%%%%%%%%%%%%   %%%% SharedInputDateComponent termController.valueChanges %%%%   %%%%%%%%%%%%%%%%%")
    })
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


  ngAfterViewInit(): void {
    // In case of the user changes the condition in shared-condition.component OR unselect/select a field, the 
    // prev saved value inside the cache (IF EXISTS) should propegate and update the value and validity of its ancestors
    // example:
    /*
     * formGroup{
     *    title:{
     *      contains: "123"
     *    }
     * }
     * 
     * After changing the condition "contains" to be "equals", the formGroup of QryFormComponent should look like the flwg:
     * 
     * formGroup{
     *    title:{
     *      equals: "123"
     *    }
     * }
     */
    let prevCachedValue = this.field.cache[CacheType.SINGLE];
    if (prevCachedValue != null) {
      this.termController.setValue(prevCachedValue)
      this.termController.markAllAsTouched()
      this.termController.updateValueAndValidity()
    }
  }

  InputValueType: typeof InputValueType = InputValueType





  //************* CVA **************************
  public onTouched: () => void = () => { };
  private onChange: Function;

  writeValue(val: any): void {
    console.log(val)
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
    return this.termController.valid ? null : { invalidSubForm: { valid: false, message: "SharedInputDateComponent Err Msg" } };
  }
  //--------------------------------------------
  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    console.log("ngOnDestroy app-qry-shared-input ngOnDestroy")
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }


}


import { ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

//************* CVA **************************
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, Validators, AbstractControl, ValidationErrors, } from "@angular/forms";
import { Observable, of, Subject } from 'rxjs';
import { InputField, InputFieldService,  InputValueType } from '../form/input-field.service';


//--------------------------------------------

@Component({
  selector: 'app-qry-shared-condition',
  templateUrl: './shared-condition.component.html',
  styleUrls: ['./shared-condition.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedConditionComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SharedConditionComponent),
      multi: true
    }
  ]
})

export class SharedConditionComponent implements OnInit {
  @Input()
  fieldkey: string;

  field: InputField;

  formGroup: FormGroup;
  selectedCondition: string;
  conditionOptions: any[];
  symbols: any;
  InputValueType: typeof InputValueType = InputValueType


  
  constructor(private formBuilder: FormBuilder, private bookInputFieldService: InputFieldService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {

    this.field = this.bookInputFieldService.getInputField(this.fieldkey);

    let _default_condition;

    if (this.field.inputValueType === InputValueType.BOOLEAN) {
      this.symbols = {
        equals: "=",
        // not: "¬", There is no need to implement "not" for this simple example
      }
      this.conditionOptions = [
        { viewValue: "equals", condition: "equals" },
        // { viewValue: "not", condition: "not" , symbol: }
      ]

      _default_condition = 'equals'
    } else if (this.field.inputValueType === InputValueType.INT
      || this.field.inputValueType === InputValueType.FLOAT
      || this.field.inputValueType === InputValueType.PHONE
    ) {
      this.symbols = {
        equals: "=",
        in: "∈",
        notIn: "∉",
        lt: "<",
        lte: "<=",
        gt: ">",
        gte: ">=",
        // not: "¬", There is no need to implement "not" for this simple example
      }

      this.conditionOptions = [
        { viewValue: "equals", condition: "equals" },
        { viewValue: "in", condition: "in" },
        { viewValue: "not in", condition: "notIn" },
        { viewValue: "less than", condition: "lt" },
        { viewValue: "less than or equals", condition: "lte" },
        { viewValue: "greater than", condition: "gt" },
        { viewValue: "greater or equals", condition: "gte" },
        // { viewValue: "not", condition: "not" , symbol: }
      ]
      _default_condition = 'equals'
    } else if (this.field.inputValueType === InputValueType.DATE){

      
      this.symbols = {
        equals: "=",
        in: "∈",
        notIn: "∉",
        lt: "<",
        lte: "<=",
        gt: ">",
        gte: ">=",
        contains: "∋",
        // if there's a need to implement (startsWith or endsWith), note that the db saves the date as yyyy MM dd Z hh mm ss. So implement the dateInput accordingly.
        // startsWith: "x..", 
        // endsWith: "..x",
        // not: "¬", There is no need to implement "not" for this simple example
      }

      this.conditionOptions = [
        { viewValue: "equals", condition: "equals" },
        { viewValue: "in", condition: "in" },
        { viewValue: "not in", condition: "notIn" },
        { viewValue: "before", condition: "lt" },
        { viewValue: "at or before", condition: "lte" },
        { viewValue: "after", condition: "gt" },
        { viewValue: "at or after", condition: "gte" },
        { viewValue: "contains", condition: "contains" },
        // if there's a need to implement (startsWith or endsWith), note that the db saves the date as yyyy MM dd Z hh mm ss. So implement the dateInput accordingly.
        // { viewValue: "starts with", condition: "startsWith" },
        // { viewValue: "ends with", condition: "endsWith" },
        // { viewValue: "not", condition: "not" , symbol: }
      ]


      _default_condition = 'contains';

    } else {
      this.symbols = {
        equals: "=",
        in: "∈",
        notIn: "∉",
        lt: "<",
        lte: "<=",
        gt: ">",
        gte: ">=",
        contains: "∋",
        startsWith: "x..",
        endsWith: "..x",
        // not: "¬", There is no need to implement "not" for this simple example
      }

      this.conditionOptions = [
        { viewValue: "equals", condition: "equals" },
        { viewValue: "in", condition: "in" },
        { viewValue: "not in", condition: "notIn" },
        { viewValue: "less than", condition: "lt" },
        { viewValue: "less than or equals", condition: "lte" },
        { viewValue: "greater than", condition: "gt" },
        { viewValue: "greater or equals", condition: "gte" },
        { viewValue: "contains", condition: "contains" },
        { viewValue: "starts with", condition: "startsWith" },
        { viewValue: "ends with", condition: "endsWith" },
        // { viewValue: "not", condition: "not" , symbol: }
      ]


      _default_condition = 'contains';

    }

    
    this.formGroup = this.formBuilder.group({})
    this.formGroup.valueChanges.pipe(
      takeUntil(this._ngUnsubscribe$)
    ).subscribe((v) => {
        this.onChange && this.onChange(v);
      })

    // To add to the formGroup a formControl with name as "_default_condition"-value.
    this.selectedCondition = _default_condition;
    this.onChangeCondition()
  }

  // workaround used inside *ngFor in the template to tear down app-qry-shared-input, every time this.formGroup.controls
  // has been updated (removed the prev controller from this.formGroup and added a new one with name = this.selectedCondition)
  Object: typeof Object = Object

  onChangeCondition() {
    let prevFormControlName = Object.keys(this.formGroup.controls)[0] // this can be undifined at the first init
    this.formGroup.removeControl(prevFormControlName)

    this.formGroup.addControl(this.selectedCondition, new FormControl('', Validators.required))

    // since (QryFormComponent.formGroup) will be changed depending on the CVA-child component, we need to trigger detectChanges
    this.changeDetectorRef.detectChanges()
  }

  showInputList() {
    return ['in', 'notIn'].includes(this.selectedCondition)
  }
  showInput() {
    return ['equals', 'lt', 'lte', 'gt', 'gte', 'contains', 'startsWith', 'endsWith',//'not' There is no need to implement "not" for this simple example
    ].includes(this.selectedCondition)
  }


  ngAfterViewInit(): void {
    // In case of the user changes the conditionin shared-condition.component OR unselect/select a field, the 
    // prev saved value inside the cache should propegate and update the value and validity of its ancestors
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

    this.onChange(this.formGroup.value)
  }


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
    return (this.formGroup.valid) ? null : { invalidSubForm: { valid: false, message: "SharedConditionComponent Err Msg" } };
  }
  //--------------------------------------------
  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    console.log("ngOnDestroy SharedConditionComponent ngOnDestroy")
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }
}
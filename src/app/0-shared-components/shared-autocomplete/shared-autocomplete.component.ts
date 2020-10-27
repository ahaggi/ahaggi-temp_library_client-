import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { FormControl } from '@angular/forms';
import {Observable,  } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-shared-autocomplete',
  templateUrl: './shared-autocomplete.component.html',
  styleUrls: ['./shared-autocomplete.component.css']
})
export class SharedAutocompleteComponent implements OnInit {
  
  myControl = new FormControl();
  @Input()
  options: SharedAutocompleteOption[];

  filteredOptions: Observable<SharedAutocompleteOption[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.myControl.valueChanges.subscribe(v=>console.log(v))
  }

  private _filter(value: string): SharedAutocompleteOption[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option =>{
      return  (option.viewValue.fst.toLowerCase().includes(filterValue)  ||
              option.viewValue.snd.toLowerCase().includes(filterValue)  )
    });
  }

    // Intercept inputs property changes with ngOnChanges
  // https://angular.io/guide/component-interaction
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.options = changes['options'].currentValue;

    // if (changes['listOfAllOptions'].isFirstChange()) { // Due to initialization by angular
    //   doStuff();
    // } else {  // due to business logic 
    //   doMoreStuff();
    // }

  }

}

export type SharedAutocompleteOption={
  value:string;
  viewValue:{fst:string , snd:string};
}
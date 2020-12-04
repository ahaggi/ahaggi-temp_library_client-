import { Component, Input, OnInit } from '@angular/core';
import { NodeStructService } from '../form/node-struct.service';
import { NestedgqlObject } from '../query-options/query-options.component';

@Component({
  selector: 'app-qry-checkbox-for-books-to-readers-qry',
  templateUrl: './checkbox-for-books-to-readers-qry.component.html',
  styleUrls: ['./checkbox-for-books-to-readers-qry.component.css']
})
export class CheckboxForBooksToReadersQryComponent implements OnInit {

  fieldsOptions: any[];
  selectedFieldValueTracker: any[];
  nestedFieldsOptions: any[];
  showBOOKasNestedFieldOption: boolean = false; // refer to weather CheckboxForBookQry component is nested inside this conmponent or not
  showREADERasNestedFieldOption: boolean = false; // refer to weather CheckboxForReaderQry component is nested inside this conmponent or not

  @Input()
  nestedIn: NestedgqlObject; // Ssince this component is nested inside another one, we need to determine which component (book or reader) which is the host. 


  constructor(private nodeStructService: NodeStructService) { }

  ngOnInit(): void {
    let prefix = '';
    switch (this.nestedIn) {
      case NestedgqlObject.BOOK:
        prefix = 'book.booksToReaders.some';
        this.nestedFieldsOptions = [
          { viewValue: "Reader's Details", value: NestedGqlObjectsInBTR.READER },
        ]
        break;

      case NestedgqlObject.READER:
        prefix = 'reader.booksToReaders.some';
        this.nestedFieldsOptions = [
          { viewValue: "Borrowed Book Details", value: NestedGqlObjectsInBTR.BOOK },
        ]
        break;

      default:
        prefix = '?'; // this can't be stand-alone component
        console.error(`CheckboxForBooksToReadersQry  ngOnInit: invalid value for nestedIn =${this.nestedIn}\nCheckboxForBooksToReadersQryComponent can't be stand-alone component`)
        this.nestedFieldsOptions = []
        break;
    }

    this.fieldsOptions = [
      { viewValue: "Borrow Date", value: prefix + "." + "borrowDate" },
      { viewValue: "Return Date", value: prefix + "." + "returnDate" },
      { viewValue: "Is returned", value: prefix + "." + "returned" },
    ]


    // For explaination of the use case where "selectedFieldValueTracker" is needed, read the comment inside ngOnDestroy
    this.selectedFieldValueTracker = []
  }

  check(bool, value) {
    // For explaination of the use case where "selectedFieldValueTracker" is needed, read the comment inside ngOnDestroy
    if (bool) {
      this.nodeStructService.EmitAddNodesEvent(value)
      this.selectedFieldValueTracker.push(value)
    } else {
      let _ind = this.selectedFieldValueTracker.indexOf(value);
      if (_ind >= 0) {
        this.nodeStructService.EmitRemoveNodesEvent(value)
        this.selectedFieldValueTracker.splice(_ind, 1)
      }
    }
  }


  showNestedComponent(bool, value: NestedGqlObjectsInBTR) {
      if (value === NestedGqlObjectsInBTR.BOOK) {
        this.showBOOKasNestedFieldOption = bool
      } else if (value === NestedGqlObjectsInBTR.READER){
        this.showREADERasNestedFieldOption = bool
      }
  
  }


  NestedgqlObject: typeof NestedgqlObject = NestedgqlObject
  NestedGqlObjectsInBTR: typeof NestedGqlObjectsInBTR = NestedGqlObjectsInBTR


  ngOnDestroy(): void {
    // In case where this component is nested inside another one (let us call it "hostComponent") AND the 
    // hostComponent.nestedFieldsOptions.thisComponent is been unselected, then we need to remove all the 
    // fields related to this component from the QryForm.component.

    this.selectedFieldValueTracker.forEach(value => this.check(false, value))
  }

}

// this enum will be used just inside this component
enum NestedGqlObjectsInBTR {
  BOOK = 'BOOK',
  READER = 'READER',
}

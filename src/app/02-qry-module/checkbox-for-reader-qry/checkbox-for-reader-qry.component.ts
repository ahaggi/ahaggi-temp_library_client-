import { Component, Input, OnInit } from '@angular/core';
import { NodeStructService } from '../form/node-struct.service';
import { NestedgqlObject } from '../query-options/query-options.component';

@Component({
  selector: 'app-qry-checkbox-for-reader-qry',
  templateUrl: './checkbox-for-reader-qry.component.html',
  styleUrls: ['./checkbox-for-reader-qry.component.css']
})
export class CheckboxForReaderQryComponent implements OnInit {

  fieldsOptions: any[];
  selectedFieldValueTracker: any[];
  nestedFieldsOptions: any[];
  showBTRasNestedFieldOption: boolean = false; // refer to weather book component is nested inside this conmponent or not

  @Input()
  nestedIn: NestedgqlObject; // refer to weather this component is nested inside CheckboxForBooksToReadersQry conmponent or not


  constructor(private nodeStructService: NodeStructService) { }

  ngOnInit(): void {
    let prefix = '';
    switch (this.nestedIn) {
      case NestedgqlObject.BOOKSTOREADERS:
        prefix = 'book.booksToReaders.some.reader';
        this.nestedFieldsOptions = []
        break;

      case NestedgqlObject.NONE:
        prefix = 'reader';
        this.nestedFieldsOptions = [
          { viewValue: "Borrowing Details", value: NestedGqlObjectsInReader.BOOKSTOREADERS },
        ]
        break;

      default:
        prefix = 'reader';
        this.nestedFieldsOptions = []
        break;
    }

    this.fieldsOptions = [
      { viewValue: "Reader's Name", value: prefix + "." + "name" },
      { viewValue: "Reader's Email", value: prefix + "." + "email" },
      { viewValue: "Reader's Costumer-Id", value: prefix + "." + "costumerId" },
      { viewValue: "Reader's Address", value: prefix + "." + "address" },
      { viewValue: "Reader's Phone", value: prefix + "." + "phone" },
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


  showNestedComponent(bool, value: NestedGqlObjectsInReader) {
    if (value === NestedGqlObjectsInReader.BOOKSTOREADERS)
      this.showBTRasNestedFieldOption = bool
  }


  NestedgqlObject: typeof NestedgqlObject = NestedgqlObject


  ngOnDestroy(): void {
    // In case where this component is nested inside another one (let us call it "hostComponent") AND the 
    // hostComponent.nestedFieldsOptions.thisComponent is been unselected, then we need to remove all the 
    // fields related to this component from the QryForm.component.

    this.selectedFieldValueTracker.forEach(value => this.check(false, value))
  }

}

// this enum will be used just inside this component
enum NestedGqlObjectsInReader {
  BOOKSTOREADERS = 'BOOKSTOREADERS',
}

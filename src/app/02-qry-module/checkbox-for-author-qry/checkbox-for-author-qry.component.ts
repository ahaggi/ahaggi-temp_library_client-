import { Component, Input, OnInit } from '@angular/core';
import { NodeStructService } from '../form/node-struct.service';
import { NestedgqlObject } from '../query-options/query-options.component';

@Component({
  selector: 'app-qry-checkbox-for-author-qry',
  templateUrl: './checkbox-for-author-qry.component.html',
  styleUrls: ['./checkbox-for-author-qry.component.css']
})
export class CheckboxForAuthorQryComponent implements OnInit {

  fieldsOptions: any[];
  selectedFieldValueTracker: any[];
  nestedFieldsOptions: any[];
  showBookAsNestedFieldOption: boolean = false; // refer to weather book component is nested inside this conmponent or not

  @Input()
  nestedIn: NestedgqlObject; // refer to weather this component is nested inside another conmponent or not


  constructor(private nodeStructService: NodeStructService) { }

  ngOnInit(): void {
    let prefix = '';
    switch (this.nestedIn) {
      case NestedgqlObject.BOOK:
        prefix = 'book.booksToAuthors.some.author';
        this.nestedFieldsOptions = []
        break;

      case NestedgqlObject.NONE:
        prefix = 'author';
        this.nestedFieldsOptions = [
          { viewValue: "Published books' Details", value: NestedGqlObjectsInAuthor.BOOK },
        ]
        break;

      default:
        prefix = 'author';
        this.nestedFieldsOptions = []
        break;
    }

    this.fieldsOptions = [
      { viewValue: "Author's Name", value: prefix + "." + "name" },
      { viewValue: "Author's Email", value: prefix + "." + "email" },
      { viewValue: "Author's Bio", value: prefix + "." + "about" },
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


  showNestedComponent(bool, value: NestedGqlObjectsInAuthor) {
    if (value === NestedGqlObjectsInAuthor.BOOK)
      this.showBookAsNestedFieldOption = bool

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
enum NestedGqlObjectsInAuthor {
  BOOK = 'BOOK',
}

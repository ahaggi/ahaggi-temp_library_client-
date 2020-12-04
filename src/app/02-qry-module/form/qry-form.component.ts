import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputValueType } from './input-field.service';
import { EventType, NodesEvent, NodeStructService } from './node-struct.service';

@Component({
  selector: 'app-qry-form',
  templateUrl: './qry-form.component.html',
  styleUrls: ['./qry-form.component.css']
})
export class QryFormComponent implements OnInit {

  // ????????????????????????????????????????????????????????????????????????????????????????
  /****************************IMPORTANT************************************ 
 * 
 *        This form will be init just once in the app lifecycle. ???????????
 *        But this.formGroup will be updated and validated everytime 
 *        nodesSubject$ emits.
 * 
 ************************************************************************** */

  @Output()
  qryRequest = new EventEmitter<any>();

  formGroup: FormGroup;

  fieldsToShow = []
  constructor(private nodeStructService: NodeStructService, private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef) { }


  ngOnInit(): void {

    this.formGroup = this.formBuilder.group({
    })

    this.nodeStructService.nodesSubject$.pipe(
      takeUntil(this._ngUnsubscribe$)
    )
      .subscribe(({ type, node, path }: NodesEvent) => {

        if (type === EventType.ADD) {
          let nodeFormGroup = this.formGroup;
          if (node.parentsFormGroupNameList != null && node.parentsFormGroupNameList.length > 0) {
            let { formGroupNameListToCreate, parentFormGroup } = this.getParentFormGroupNameListToCreate(node.parentsFormGroupNameList, nodeFormGroup)
            nodeFormGroup = this.addNodesFormGroups(formGroupNameListToCreate, parentFormGroup)
          }
          nodeFormGroup.addControl(node.nodeFormGroupName, new FormControl(''))

          this.fieldsToShow.push(node)
          console.log(this.fieldsToShow)


          // since (this.formGroup.valid) will be changed depending on the CVA-child component, we need to trigger detectChanges
          this.changeDetectorRef.detectChanges()

        } else if (type === EventType.REMOVE) {

          let _ind = this.fieldsToShow.findIndex((field) => field.path === path)
          if (_ind >= 0) {
            this.fieldsToShow.splice(_ind, 1)
            this.RemoveNodeFormGroup(node.parentsFormGroupNameList, node.nodeFormGroupName)
          } else
            console.error(`######### QryFormComponent : EventType.REMOVE #########\nThe field with path=${path} is not found inside this component!!`)
        }
      })
  }

  RemoveNodeFormGroup(_fgnList: string[], _formContorlName: string): void {
    // We need to check wheather the parentNodeFormGroup (i.e. storage , author , reader) has more than one child FormControl/FormGroup, 
    // if it has more the one child FormControl/FormGroup (i.e. borrowedQuantity AND quantity, authorsName AND,,), then remove all the parent fgnList and the childNode
    // if it has just one child FormControl/FormGroup (i.e. borrowedQuantity OR quantity, authorsName OR,,), then JUST remove that childNode

    // the form {
    //   "isbn": {
    //     "contains": "123"
    //   },
    //   "storage": {
    //     "borrowedQuantity": "",
    //       "quantity": ""
    //   },
    //   "bookToAuthors": {
    //     "some": {
    //       "author": {
    //         "name": {
    //           "contains": "d"
    //         },
    //         "email": {
    //           "contains": "q@q"
    //         }
    //       }
    //     }
    //   },
    //   "bookToReaders": {
    //     "some": {
    //       "borrowDate": {
    //         "contains": "2020"
    //       },
    //       "returnDate": {
    //         "contains": "2020"
    //       }
    //     }
    //   }
    // }

    let formGroupNameList = [..._fgnList];

    let path = formGroupNameList.join('.')
    let _parentFormGroup: FormGroup = this.formGroup.get(path) as FormGroup

    if (_parentFormGroup) { // this is eqv to checking formGroupNameList.length > 0
      if (Object.values(_parentFormGroup.controls).length > 1) {
        // for ex if the _parentFormGroup "storage" has both children "borrowedQuantity" AND "quantity"
        _parentFormGroup.removeControl(_formContorlName)
      } else {
        // for ex if the _parentFormGroup "storage" has ONlY children "borrowedQuantity" OR "quantity"
        let _nodeFormGroupName: string = formGroupNameList.shift();
        this.formGroup.removeControl(_nodeFormGroupName)
      }
    } else {
      // if the _parentFormGroup always has only 1 child like "title, pages ..."
      this.formGroup.removeControl(_formContorlName)
    }
  }

  getParentFormGroupNameListToCreate(_fgnList: string[], _parentFormGroup: FormGroup): { formGroupNameListToCreate: string[]; parentFormGroup: FormGroup; } {
    let formGroupNameList = [..._fgnList];
    let _formGroupName: string = formGroupNameList.shift();
    let _isExist = true;

    while (_isExist && _formGroupName) {
      _isExist = this.checkFormGroupExists(_formGroupName, _parentFormGroup)
      if (_isExist) {
        _parentFormGroup = _parentFormGroup.get(_formGroupName) as FormGroup
        _formGroupName = formGroupNameList.shift();
      } else {
        formGroupNameList = [_formGroupName, ...formGroupNameList]
      }
    }
    return { formGroupNameListToCreate: formGroupNameList, parentFormGroup: _parentFormGroup };
  }

  addNodesFormGroups(_fgnList: string[], _parentFormGroup: FormGroup): FormGroup {
    const addNodeFormGroup = (formGroupName: string, parent: FormGroup): FormGroup => {
      let fg = this.formBuilder.group({})
      parent.addControl(formGroupName, fg)
      return parent.get(formGroupName) as FormGroup
    }

    let _nodeFromGroup = _parentFormGroup;
    if (_fgnList != null && typeof _fgnList !== 'undefined' && _fgnList.length > 0)
      _fgnList.forEach((fgn) => {
        _nodeFromGroup = addNodeFormGroup(fgn, _nodeFromGroup)
      })
    return _nodeFromGroup;
  }



  checkFormGroupExists(parentsFormGroupNameList: string[] | string, parent: FormGroup): boolean {
    return parent.get(parentsFormGroupNameList) !== null
  }

  formHasControllers() {
    return Object.values(this.formGroup.controls).length !== 0
  }

  //TO BE USED JUST INSIDE THE TEMPLATE
  getParentNodeFormGroup(parentsFormGroupNameList: string[]): FormGroup {
    return this.formGroup.get(parentsFormGroupNameList.join('.')) as FormGroup
  }



  submit() {
    if (this.formGroup.valid)
      this.qryRequest.emit(this.formGroup.value);


  }

  identify(index, item) {
    return item.path;
  }

  // to get access to the enum inside the template
  InputValueType: typeof InputValueType = InputValueType

  private _ngUnsubscribe$: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {

    console.log("ngOnDestroy QryFormComponent ngOnDestroy")
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }
}




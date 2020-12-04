import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


// import {QryModule} from '../qry.module'

// @Injectable({
//   providedIn: QryModule  // OBS: available just in the QryModule scope
// })

@Injectable({
  providedIn: 'root'
})
export class NodeStructService {
  nodes: any;
  nodesSubject$: Subject<NodesEvent>;


  constructor() {

    this.nodesSubject$ = new Subject<NodesEvent>();

    /****************************IMPORTANT************************************ 
     * 
     *        Take into consideration the circular reference in:
     *        BOOK, AUTHOR and READER
     *        When implementing checkbox-for-book-qry  ,  checkbox-for-author-qry   and   checkbox-for-reader-qry 
     * 
     ************************************************************************** */

    const BOOK = {
      title: {},
      isbn: {},
      pages: {},
      chapters: {},
      price: {},
      description: {},
      // available: {},
      storage: { quantity: {}, borrowedQuantity: {} },
      booksToAuthors: null,
      booksToReaders: null
    }

    const AUTHOR = {
      name: {},
      email: {},
      about: {},
      booksToAuthors: null,
    }

    const READER = {
      name: {},
      email: {},
      costumerId: {},
      address: {},
      phone: {},
      booksToReaders: null
    }

    const BOOKSTOAUTHORS = {
      some: {
        author: AUTHOR,
        book: BOOK
      }
    }

    const BOOKSTOREADERS = {
      some: {
        borrowDate: {},
        returnDate: {},
        returned: {},
        reader: READER,
        book: BOOK
      }
    }

    BOOK.booksToAuthors = BOOKSTOAUTHORS;
    AUTHOR.booksToAuthors = BOOKSTOAUTHORS;

    BOOK.booksToReaders = BOOKSTOREADERS;
    READER.booksToReaders = BOOKSTOREADERS;

    this.nodes = {
      book: BOOK,
      author: AUTHOR,
      reader: READER
    }

  }


  constructNode(emptyNode, _nodePath: string) {

    // the path is the full path i.e. "author.booksToAuthors.some.book.title" or "book.title"
    // this will be used inside the form-qry, and it's identical to keys-value in *QryStrucComponent and input-field-service
    let path = _nodePath;

    let pathList = _nodePath.split('.')

    // nodeFormGroupName is the last node in the path like "title" in "author.booksToAuthors.some.book.title" or "book.title"
    let nodeFormGroupName = pathList.pop()


    // parentsFormGroupNameList is all of nodes EXCEPT the first one: ["booksToAuthors","some","book"] in "author.booksToAuthors.some.book.title"
    pathList.shift()
    let parentsFormGroupNameList = pathList;


    // when _nodePath is "author.booksToAuthors.some.book.title" => { key: "author.booksToAuthors.some.book.title", nodeFormGroupName: "title", parentsFormGroupNameList: ["booksToAuthors","some","book"], },
    // when _nodePath is "book.title" => { key: "book.title", nodeFormGroupName: "title", parentsFormGroupNameList: [], },
    // when _nodePath is "book.storage.quantity" => { key: "book.storage.quantity", nodeFormGroupName: "quantity", parentsFormGroupNameList: ["storage"], },
    let temp: Node = { path: path, nodeFormGroupName: nodeFormGroupName, parentsFormGroupNameList: parentsFormGroupNameList }
    Object.assign(emptyNode, temp)
  }


  traverseDotedPath(_obj: any, _path: string) {
    let pathList = _path.split('.')
    const reducer = (obj, key) => (_path == null || typeof _path === 'undefined') ? null : obj[key];
    let node: Node = pathList.reduce(reducer, _obj)
    return node
  }

  EmitAddNodesEvent(_nodePath: string) {
    if (_nodePath == null || typeof _nodePath === 'undefined') {
      console.error(`######### NodeStructService : EmitAddNodesEvent #########\ninvalid _nodePath ${_nodePath}`)
    } else {
      let node = this.traverseDotedPath(this.nodes, _nodePath)

      // its sufficient to check if the node hasOwnProperty 'path', to determine whether the node has been init before.
      // But it is important to check if "node" has been init before with diff. path, to avoid the flwg senario:
      // prev node.path = "author.booksToAuthors.some.book.title", but the new path _nodePath="book.title".
      // This'll also ensure that parentsFormGroupNameList will be compatible with _nodePath.
      if (!Object.prototype.hasOwnProperty.call(node, 'path')// Object.keys(node).length === 0
        || node.path != _nodePath) {
        this.constructNode(node, _nodePath)
      }


      this.nodesSubject$.next({ path: _nodePath, type: EventType.ADD, node: node, })
    }
  }

  EmitRemoveNodesEvent(_nodePath: string) {
    let node = this.traverseDotedPath(this.nodes, _nodePath)

    // its sufficient to check if the node hasOwnProperty 'path', to determine whether the node has been init before
    if (_nodePath == null || typeof _nodePath === 'undefined' || !node?.path) {
      console.warn(`######### NodeStructService : EmitRemoveNodesEvent #########\ninvalid _nodePath ${_nodePath}`)
    } else {
      this.nodesSubject$.next({ path: _nodePath, type: EventType.REMOVE, node: node, })
    }
  }
}

export enum EventType {
  ADD = "ADD",
  REMOVE = "REMOVE",
}

export type NodesEvent = {
  path: string;
  node: Node;
  type: EventType;
}

export type Node = {
  path: string;
  nodeFormGroupName: string;
  parentsFormGroupNameList: string[];
}
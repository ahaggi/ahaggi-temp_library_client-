import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  createdBookSub,
  updatedBookSub,
  deletedBookSub,
  createdAuthorSub,
  updatedAuthorSub,
  deletedAuthorSub,
  createdReaderSub,
  updatedReaderSub,
  deletedReaderSub
} from 'src/app/util/gqlUtil/subscriptionsDef';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  // emit the last 1000 notification since the dashboard has been visited within the last hour.
  subject = new ReplaySubject(1000 , (60*60*1000));


  constructor(private apollo: Apollo) {
    let obsList = [
      this.getCreatedBookNotification(),
      this.getUpdatedBookNotification(),
      this.getDeletedBookNotification(),

      this.getCreatedAuthorNotification(),
      this.getUpdatedAuthorNotification(),
      this.getDeletedAuthorNotification(),

      this.getCreatedReaderNotification(),
      this.getUpdatedReaderNotification(),
      this.getDeletedReaderNotification(),
    ]
    merge(...obsList).subscribe(this.subject)

    // this.subject.subscribe((v)=>console.log(` 1111111111 NotificationsService ${v}  `))

  }

  /**
   * NOTE:
   *    instead of using this.apollo.subscribe<any>({..}), we can use 
   *          this.apollo.subscribeToMore<any>({
   *              document: createdBookSub,
   *              updateQuery: (prev, {subscriptionData}) => { 
   *                            some logic to update the cache with the data which been pushed with "createdBookSub" from the server
   *              })
   *          })
   * 
   *    With "subscribeToMore" we can use the data sent along with the notification and merge it directly into the store.
   *    Note that the (updateQuery callback) and/or "subscriptionData", must return an object of the same shape as the "getBookByIDQry"
   * 
   */


  /**************************************** Book ************************************************* */

  private getCreatedBookNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: createdBookSub,
    }).pipe(
      map((res) => res.data.createdBookSub),
      map((book) => {
        let id = book.id;
        let title = book.title;
        let isbn = book.isbn;
        return { id: id, type: _NotificationType.CREATED, payload: { title: title, description: `Data abt the book:\n ${title}\n${isbn}\nhas been created.` } as _NotificationPayload } as _Notification
      })
    )
  }

  private getUpdatedBookNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: updatedBookSub,
    }).pipe(
      map((res) => res.data.updatedBookSub),
      map((book) => {
        let id = book.id;
        let title = book.title;
        let isbn = book.isbn;
        return { id: id, type: _NotificationType.UPDATED, payload: { title: title, description: `Data abt the book:\n ${title}\n${isbn}\nhas been updated.` } as _NotificationPayload } as _Notification
      })
    )
  }

  private getDeletedBookNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: deletedBookSub,
    }).pipe(
      map((res) => res.data.deletedBookSub),
      map((book) => {
        let id = book.id;
        let title = book.title;
        let isbn = book.isbn;
        return { id: id, type: _NotificationType.DELETED, payload: { title: title, description: `Data abt the book:\n ${title}\n${isbn}\nhas been updated.` } as _NotificationPayload } as _Notification
      })
    )
  }




  /**************************************** Author ************************************************* */

  private getCreatedAuthorNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: createdAuthorSub,
    }).pipe(
      map((res) => res.data.createdAuthorSub),
      map((author) => {
        let id = author.id;
        let name = author.name;
        let email = author.email;
        return { id: id, type: _NotificationType.CREATED, payload: { title: name, description: `Data abt the Author:\n ${name}\n${email}\nhas been created.` } as _NotificationPayload } as _Notification
      })
    )
  }

  private getUpdatedAuthorNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: updatedAuthorSub,
    }).pipe(
      map((res) => res.data.updatedAuthorSub),
      map((author) => {
        let id = author.id;
        let name = author.name;
        let email = author.email;
        return { id: id, type: _NotificationType.UPDATED, payload: { title: name, description: `Data abt the Author:\n ${name}\n${email}\nhas been updated.` } as _NotificationPayload } as _Notification
      })
    )
  }


  private getDeletedAuthorNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: deletedAuthorSub,
    }).pipe(
      map((res) => res.data.deletedAuthorSub),
      map((author) => {
        let id = author.id;
        let name = author.name;
        let email = author.email;
        return { id: id, type: _NotificationType.DELETED, payload: { title: name, description: `Data abt the Author:\n ${name}\n${email}\nhas been updated.` } as _NotificationPayload } as _Notification
      })
    )
  }



  /**************************************** Reader ************************************************* */

  private getCreatedReaderNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: createdReaderSub,
    }).pipe(
      map((res) => res.data.createdReaderSub),
      map((reader) => {
        let id = reader.id;
        let name = reader.name;
        let email = reader.email;
        return { id: id, type: _NotificationType.CREATED, payload: { title: name, description: `Data abt the Reader:\n ${name}\n${email}\nhas been created.` } as _NotificationPayload } as _Notification
      })
    )
  }

  private getUpdatedReaderNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: updatedReaderSub,
    }).pipe(
      map((res) => res.data.updatedReaderSub),
      map((reader) => {
        let id = reader.id;
        let name = reader.name;
        let email = reader.email;
        return { id: id, type: _NotificationType.UPDATED, payload: { title: name, description: `Data abt the Reader:\n ${name}\n${email}\nhas been updated.` } as _NotificationPayload } as _Notification
      })
    )
  }

  private getDeletedReaderNotification(): Observable<_Notification> {
    return this.apollo.subscribe<any>({
      query: deletedReaderSub,
    }).pipe(
      map((res) => res.data.deletedReaderSub),
      map((reader) => {
        let id = reader.id;
        let name = reader.name;
        let email = reader.email;
        return { id: id, type: _NotificationType.DELETED, payload: { title: name, description: `Data abt the Reader:\n ${name}\n${email}\nhas been updated.` } as _NotificationPayload } as _Notification
      })
    )
  }

}






export type _Notification = {
  id: string,
  type: _NotificationType,
  payload: _NotificationPayload
}

type _NotificationPayload = {
  title: string,
  description: string,
}

export enum _NotificationType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}
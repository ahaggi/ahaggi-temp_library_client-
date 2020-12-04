import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { merge, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NotificationsService, _NotificationType } from './notifications.service';



@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  constructor(private notificationsService: NotificationsService) { }

  notificationList = []

  ngOnInit(): void {
    this.notificationsService.subject
      .pipe(
        takeUntil(this._ngUnsubscribe$)
      ).subscribe(event => {
        this.notificationList.push(event)
        console.log(event)
      });
  }

  identify(_, item) {
    return item.id;
  }
  
  _NotificationType: typeof _NotificationType = _NotificationType;
  private _ngUnsubscribe$: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }



}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



import { QryComponent } from './qry.component'



const routes: Routes = [
  { path: 'qry', component: QryComponent },
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class SearchQryRoutingModule { }

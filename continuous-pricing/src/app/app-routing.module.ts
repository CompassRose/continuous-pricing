import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContinousPricingComponent } from './pricing-grid/grid.component';

const routes: Routes = [
  { path: '', component: ContinousPricingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

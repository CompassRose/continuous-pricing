import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
//import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ContinousPricingComponent } from './pricing-grid/grid.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxResizeObserverModule } from 'ngx-resize-observer';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuAvailabilityComponent } from './au-vailability.component/au-availability.component';
import { FlightHeaderComponent } from './pricing-grid/Fight-header/flight-header.component';
import { BipPriceConfigureComponent } from './bid-price-configure/bid-price-configure.component';
import { ContinousBidPricingComponent } from './au-visualization-chart/au-visualization-chart.component';
import { DragPointDistributionService } from './services/drag-point-distribution';
import { BidPriceWebViewService } from '../app/api/au-visualization.service';

import { BidPriceAspNetService } from "./api/au-visualization.service";

/// import { ConfigurationModule } from "./configuration/configuration.module";
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { MaterialExampleModule } from '../material.module';
import { MatIconModule } from '@angular/material/icon';
import { arrowRepeat } from 'ngx-bootstrap-icons';
import { caretDownSquare } from 'ngx-bootstrap-icons';
import { caretUpSquare } from 'ngx-bootstrap-icons';
import { caretRightFill } from 'ngx-bootstrap-icons';
import { caretLeftFill } from 'ngx-bootstrap-icons';
import { boxArrowRight } from 'ngx-bootstrap-icons';
import { boxArrowLeft } from 'ngx-bootstrap-icons';

const icons = {
  arrowRepeat,
  caretDownSquare,
  caretUpSquare,
  caretLeftFill,
  caretRightFill,
  boxArrowRight,
  boxArrowLeft
}

@NgModule({
  declarations: [
    AppComponent,
    ContinousPricingComponent,
    FlightHeaderComponent,
    BipPriceConfigureComponent,
    ContinousBidPricingComponent,
    AuAvailabilityComponent
  ],
  imports: [
    BrowserModule,

    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxResizeObserverModule,
    MaterialExampleModule,
    MatIconModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxBootstrapIconsModule.pick(icons, {
      width: '1.25em',
      height: '1.25em'
    }),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [{
    provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR'
  },
    BidPriceAspNetService,
    BidPriceWebViewService,
    DragPointDistributionService],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ContinousPricingComponent } from './pricing-grid/grid.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxResizeObserverModule } from 'ngx-resize-observer';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from '../material.module';
import { AuAvailabilityComponent } from './auAvailability.component/AuAvailability.component';
import { FlightHeaderComponent } from './pricing-grid/Fight-header/flight-header.component';
import { MatSliderModule } from '@angular/material/slider';
import { BipPriceConfigureComponent } from './bid-price-configure/bid-price-configure.component';
import { ContinousBidPricingComponent } from './continuous-bidpricing-chart/continuous-bidpricing-chart.component';


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
    MatSliderModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [{ provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ThemeControlService {

  public chartThemeToggle = 'light';
  public chartThemeText = 'Dark';
  public chartTextColor = 'black'
  public resetThemeSubject$ = new Subject<string>();

  constructor() { }


  public toggleLightMode() {

    if (this.chartThemeToggle === 'dark') {
      this.chartThemeText = 'Dark'
      this.chartThemeToggle = 'light';
      this.chartTextColor = 'black';
      this.resetThemeSubject$.next('light')
    } else {
      this.chartThemeText = 'Light'
      this.chartThemeToggle = 'dark';
      this.chartTextColor = 'white';
      this.resetThemeSubject$.next('dark')
    }

  }

}

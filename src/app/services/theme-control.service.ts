import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ThemeControlService {
  public resetThemeSubject$ = new Subject<string>();
  // true === 'light
  public isThemeChange: boolean;
  public chartThemeSelect = 'light';

  constructor() {

    const savedTheme = JSON.parse(window.localStorage.getItem('colorTheme'));

    if (savedTheme === null) {
      this.isThemeChange = false;
      this.chartThemeSelect = 'light';
      window.localStorage.setItem('colorTheme', JSON.stringify(JSON.parse(JSON.stringify(this.chartThemeSelect))));
      this.resetThemeSubject$.next('light');

    } else {
      this.isThemeChange = savedTheme === 'dark' ? true : false;
      this.chartThemeSelect = this.isThemeChange ? 'dark' : 'light';
      this.resetThemeSubject$.next(this.chartThemeSelect)
    }
  }

  // On Theme change Dark/Light
  onThemeChange() {

    this.isThemeChange = !this.isThemeChange;
    this.chartThemeSelect = this.isThemeChange ? 'dark' : 'light';

    console.log('onThemeChange ', this.chartThemeSelect, ' isThemeChange ', this.isThemeChange)
    this.resetThemeSubject$.next(this.chartThemeSelect)
    window.localStorage.setItem('colorTheme', JSON.stringify(JSON.parse(JSON.stringify(this.chartThemeSelect))));
  }
}

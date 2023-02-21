import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ThemeControlService {

  public chartThemeToggle = 'dark';
  public chartThemeText = 'Light';
  public chartTextColor = 'white'
  public resetThemeSubject$ = new Subject<string>();


  constructor() {

    const savedTheme = JSON.parse(window.localStorage.getItem('colorTheme'));

    //console.log('tempSavedCollection ', savedTheme)

    if (savedTheme === null) {

      window.localStorage.setItem('colorTheme', JSON.stringify(JSON.parse(JSON.stringify(this.chartThemeToggle))));
      this.chartThemeText = 'Light'
      this.chartThemeToggle = 'dark';
      this.chartTextColor = 'white';
      this.resetThemeSubject$.next('dark')

    } else {

      this.chartThemeToggle = savedTheme;

      if (this.chartThemeToggle === 'dark') {
        this.chartThemeText = 'Light'
        this.chartTextColor = 'black';
        this.resetThemeSubject$.next('dark')
      } else {
        this.chartThemeText = 'Dark'
        this.chartTextColor = 'white';
        this.resetThemeSubject$.next('light')
      }

    }


  }


  public toggleLightMode() {
    // console.log('toggleLightMode ', this.chartThemeToggle)

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
    window.localStorage.setItem('colorTheme', JSON.stringify(JSON.parse(JSON.stringify(this.chartThemeToggle))));

  }

}

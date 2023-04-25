import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../app/services/data-security.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  providers: [SecurityService]
})

export class AppComponent implements OnInit {
  title = 'angular-rm-overview';
  safeValue: SafeHtml;

  constructor(private secure: SecurityService) {
    this.safeValue = this.secure.getSafeHtml("<h1>Sanitization Success</h1>");
    console.log('\n{{{  AppComponent this.safeValue }}}', this.safeValue, '\n')
  }

  ngOnInit() {

  }
}

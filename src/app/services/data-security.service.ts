import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()

export class SecurityService {
    constructor(private sanitizer: DomSanitizer) {
    }
    getSafeHtml(html: string) {

        //bypassSecurityTrustScript
        // bypassSecurityTrustStyle
        // bypassSecurityTrustUrl
        // bypassSecurityTrustResourceUrl

        console.log('SAFE ', html, ' sanitizer ', this.sanitizer)
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
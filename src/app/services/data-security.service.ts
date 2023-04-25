import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()

export class SecurityService {
    constructor(private sanitizer: DomSanitizer) {
    }
    getSafeHtml(html: string) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
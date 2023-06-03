import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class DragPointDistributionService {

    public bucketDetailsFromShared;
    private upFinished = false;
    private downFinished = false;
    constructor() { }


    public applyDragBuckets(buckets, direction: any): void {
        //  console.log('applyDragBuckets bucketValues ', buckets, ' direction ', direction)
    }
}



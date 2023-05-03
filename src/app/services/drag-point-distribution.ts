import { Injectable } from '@angular/core';
import { BucketDetails } from '../models/dashboard.model';

@Injectable({
    providedIn: 'root',
})

export class DragPointDistributionService {

    public bucketDetailsFromShared;

    constructor() {

        // console.log('DragPointDistributionService constructor ')
        // this.bucketDetailsFromShared = bucketDetails;
    }


    public applyDragBuckets(buckets, direction: any): void {
        //  console.log('applyDragBuckets bucketValues ', buckets, ' direction ', direction)
    }


    // Multiple nodes selected
    public dragSelectedNodes(selected, points, dir: string, target): void {

        //  console.log('DragPointDistributionService  ', ' selected ', selected, ' target ', target, ' dir ', dir)

        selected.forEach((se: number) => {

            const bucketInfo = points[se];

            //  console.log('dragSelectedNodes dir ', se, ' bucketInfo ', bucketInfo)

            if (dir === 'up') {

                bucketInfo.Aus += 1;
                //  console.log('Up: bucketInfo:  ', bucketInfo.letter, ' Aus ', bucketInfo.Aus, ' targetAu ',)

            } else {
                ///   console.log('Down bucketInfo:  ', bucketInfo.letter, ' Aus ', bucketInfo.Aus, ' targetAu ',)
                bucketInfo.Aus -= 1;
            }
        })
    }
}
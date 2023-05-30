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


    // // Multiple nodes selected
    // public dragSelectedNodes(selected, points, dir: string, target): void {

    //     // console.log('DragPointDistributionService ', ' selected ', selected[selected.length - 1], ' target ', target, ' dir ', dir)

    //     selected.forEach((se: number, i) => {

    //         const bucketInfo = points[se];

    //         //  console.log(' Aus  ', points[selected[0]].Aus, ' points ', points[selected[0]].letter, ' v ', points[selected[selected.length - 1]].letter, ' Aus ', points[selected[selected.length - 1]].Aus)

    //         if (dir === 'up') {
    //             //console.log('  Up ', bucketInfo.Aus)
    //             // if (points[selected[0]].Aus < 190) {
    //             bucketInfo.Aus += 1;
    //             // }


    //         } else {
    //             // if (points[selected[selected.length - 1]].Aus > 0) {
    //             bucketInfo.Aus -= 1;
    //             // }
    //         }




    //         //console.log('DragPointDistributionService  ', ' bucketInfo ', bucketInfo.Aus)

    //     })
    // }
}



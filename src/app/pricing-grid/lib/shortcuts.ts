import { KeyCode } from "./keycodes";
import { fromEvent, merge, combineLatest, Observable } from "rxjs";
import { distinctUntilChanged, share, filter, tap } from "rxjs/operators";


export const singleShortcut = (shortcut: KeyCode) => {

    console.log('KeyboardEvent  ', shortcut)
    const keyDown$ = fromEvent<KeyboardEvent>(document, "keydown");
    const keyUp$ = fromEvent<KeyboardEvent>(document, "keyup");


    const singleKeyEvents = merge(keyDown$, keyUp$).pipe(
        distinctUntilChanged((a, b) => {
            // console.log('KeyboardEvent \na ', a, '\n\nb ', b)
            return a.code === b.code && a.type === b.type
        }),
        share()
    );



}

export const shortcut = (shortcut: KeyCode[]) => {

    //console.log('KeyboardEvent  ', shortcut)
    const keyDown$ = fromEvent<KeyboardEvent>(document, "keydown");
    const keyUp$ = fromEvent<KeyboardEvent>(document, "keyup");


    const keyEvents = merge(keyDown$, keyUp$).pipe(
        distinctUntilChanged((a, b) => {
            //console.log('KeyboardEvent \na ', a.code, '\n\nb ', b.code, ' type a ', a.type, ' b.type ', b.type)
            return a.code === b.code && a.type === b.type
        }),
        share()
    );


    const createKeyPressStream = (charCode: KeyCode) =>
        keyEvents
            .pipe(
                filter((event) => {
                    // console.log('createKeyPressStream  ', event.code, '  charCode ', charCode.valueOf())
                    if (event.code === charCode.valueOf()) {
                        //   console.log('   |||||||    createKeyPressStream  ', event.code, ' charCode ', charCode)
                    }
                    return event.code === charCode.valueOf()
                }));


    return combineLatest(shortcut.map((s) => createKeyPressStream(s)))
        .pipe(
            filter<KeyboardEvent[]>((arr) => {
                // console.log('combineLatest  ', arr)
                let type;
                return arr.every((a) => {
                    // console.log('combineLatest UP ', a)
                    if (a.type === "keyup") {
                        // console.log('combineLatest UP ', a.ctrlKey)
                        type = a.type
                    } else {
                        // console.log('combineLatest Down ', a.ctrlKey)
                        type = a.type
                    }
                    return type
                })
            }))
};

export function sequence() {

    return (source: Observable<KeyboardEvent[]>) => {
        //  console.log('KeyboardEvent ', source)
        return source.pipe(
            filter((arr) => {
                //console.log('arr ', arr)
                const sorted = [...arr]
                    .sort((a, b) => (a.timeStamp < b.timeStamp ? -1 : 1))
                    .map((a) => a.code)
                    .join();
                const seq = arr.map((a) => a.code).join();
                return sorted === seq;
            })
        );
    };
}
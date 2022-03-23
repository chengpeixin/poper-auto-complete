export const addEvent = <K extends keyof ElementEventMap>(dom:Element,eventName:string,handler:(this: Element, ev: ElementEventMap[K]) => any,opts={stop:false}) => {
    dom.addEventListener(eventName,function(e){
        if ( opts.stop ){
            e.stopPropagation();
        }
        handler.call(this,e)
    })
}
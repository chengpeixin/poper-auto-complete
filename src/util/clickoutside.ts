const elms:{
    target:HTMLElement,
    handler:Function
}[] = []
document.addEventListener('mouseup',(e)=>{
    elms.forEach(el=>{

        if ( (el.target) === e.target ||
            el.target.contains(e.target as HTMLElement)
        ){
            return
        }
        el.handler()
    })
})
export default (target:HTMLElement,handler:Function) => {
    const elm = elms.find(el=>el.target===target)
    if (elm){
        elm.handler = handler
    } else {
        elms.push(
            {
                target: target,
                handler: handler
            }
        )
    }
}
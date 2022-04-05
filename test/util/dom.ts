export const getDom = (tag:string) => {
    return document.createElement(tag)
}


export const triggerInput = (input:HTMLInputElement) => {
    let evt = document.createEvent('HTMLEvents');
    evt.initEvent('input', true, true);
    input.dispatchEvent(evt)
}
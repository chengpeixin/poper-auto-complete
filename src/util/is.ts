// 是否chrome浏览器
export const isChrome = () =>{
    return navigator.userAgent.indexOf('Chrome') > -1
}

// 是否是mac平台或者safari
export const isMac = () => {
    return navigator.userAgent.indexOf('Safari') > -1
}
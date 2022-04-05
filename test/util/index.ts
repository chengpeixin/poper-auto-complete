export const sleep = (timer:number) => {
    return new Promise((resolve)=>{
        const index = setTimeout(()=>{
            resolve(index)
        },timer)
    })
}
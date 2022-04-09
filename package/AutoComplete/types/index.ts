export type Option =  {
    value: string 
    label: string 
    index: number
    effective: boolean
}

export type Opts = {
    options:Option[]
    width:string
    height:number
    // 点击后是否关闭poper，默认不关闭
    selectionClose:boolean
}
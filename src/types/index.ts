export type Option =  {
    value: string 
    label: string 
    index: number
    effective: boolean
}

export type Opts = {
    options:Option[]
    width:number
}
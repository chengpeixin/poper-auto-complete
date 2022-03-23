export default class Poper {
    poperDom:HTMLDivElement
    target:HTMLDivElement
    targetRect:{}
    softState = false
    constructor(target:HTMLDivElement,opts={}){
        this.target = target
        this._getTarget()
        this._initDom()
        this._mount()    
    }
    private _getTarget(){
        this.targetRect = this.target.getBoundingClientRect()
    }
    private _initDom (){
        const {top,height,left,width} = this.targetRect
        this.poperDom = document.createElement('div')
        this.poperDom.className = 'auto-complete-poper-full'
        this.poperDom.style.position = 'absolute'
        this.poperDom.style.height = '80px'
        this.poperDom.style.width = `${width}px`
        this.poperDom.style.transformOrigin = 'center top'
        this.poperDom.style.zIndex = '100'
        this.poperDom.style.top = `${top + height}px`
        this.poperDom.style.left = `${left}px`
        this.poperDom.style.display = 'block'
        this.poperDom.style.border = `1px solid red`
        this.poperDom.innerHTML = "帅"
    }
    private _mount(){
        this.softState = true
        document.body.appendChild(this.poperDom)
    }

    destroy(){

    }

    public show(){
        const {top,height,left} = this.targetRect
        this.poperDom.style.top = `${top + height}px`
        this.poperDom.style.left = `${left}px`
        this.poperDom.style.display = 'block'
        this.softState = true
    }
    public hide(){
        this.softState = false
        this.poperDom.style.display = 'none'
        this.poperDom.style.top = '0px'
        this.poperDom.style.left = '0px'
    }
}
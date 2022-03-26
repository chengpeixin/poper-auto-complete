import { css } from '@stitches/core';
import { CssComponent } from '@stitches/core/types/styled-component';
import VirtualList from './VirtualList';
import eventBus from '../util/EventBus'
export default class Poper {
    poperDom:HTMLDivElement
    target:HTMLDivElement
    containerDom:HTMLDivElement
    targetRect:{}
    softState = false
    poperStyle:CssComponent
    constructor(target:HTMLDivElement,datas,opts={}){
        this.target = target
        this._getTarget()
        this._initDom()
        this._mount()
        eventBus.on('click-label-item',(e)=>{
            console.log(e)
        })
        new VirtualList(datas,this.containerDom)
    }
    private _getTarget(){
        this.targetRect = this.target.getBoundingClientRect()
    }
    private _initDom (){
        const {top,height,left,width} = this.targetRect
        this.poperDom = document.createElement('div')
        this.poperStyle = css({
            display: 'block',
            position: 'absolute',
            width:`${width}px`,
            height:'400px',
            transformOrigin: 'center top',
            zIndex: '100',
            top: `${top + height}px`,
            left: `${left}px`,
            boxSizing: 'border-box',
            border: `1px solid red`
        })
        this.poperDom.className = this.poperStyle().className
    }
    private _mount(){
        this.softState = true
        this.containerDom = document.createElement('div')
        this.poperDom.appendChild(this.containerDom)
        document.body.appendChild(this.poperDom)
    }

    destroy(){

    }

    public show(){
        const {top,height,left} = this.targetRect
        this.poperDom.className = this.poperStyle({
            css:{
                display: 'block'
            }
        }).className
        this.softState = true
    }
    public hide(){
        this.softState = false
        this.poperDom.className = this.poperStyle({
            css:{
                display: 'none'
            }
        }).className
    }
}
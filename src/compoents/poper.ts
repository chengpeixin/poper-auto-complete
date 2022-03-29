import { css } from '@stitches/core';
import { CssComponent } from '@stitches/core/types/styled-component';
import VirtualList from './VirtualList';
import { cloneDeep } from 'lodash'
import { attributesModule, classModule, eventListenersModule, h, init, propsModule, styleModule, VNode } from 'snabbdom'
const patch  = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    attributesModule
])
export default class Poper {
    poperDom:HTMLDivElement
    target:HTMLDivElement
    containerDom:HTMLDivElement
    targetRect:DOMRect
    softState = false
    poperStyle:CssComponent
    virtualList: VirtualList
    containerVnode:VNode
    poperVnode:VNode
    constructor(target:HTMLDivElement,datas,opts={}){
        this.target = target
        this._getTarget()
        this._initDom()
        this._mount()
        this.virtualList = new VirtualList(datas,this.containerVnode)
    }
    private _getTarget(){
        this.targetRect = this.target.getBoundingClientRect()
    }
    private _initDom (){
        const {top,height,left,width} = this.targetRect
        this.poperStyle = css({
            'display': 'block',
            'position': 'absolute',
            'width':`${width}px`,
            'height':`210px`,
            'transform-origin': 'center top',
            'z-index': '100',
            'top': `${top + height}px`,
            'left': `${left}px`,
            'box-sizing': 'border-box',
            'min-height':'0px',
            'max-height':'400px',
            'border':'1px solid #e4e7ed',
            'border-radius': '4px',
            'background-color':'#fff',
            'box-shadow':'0 2px 12px 0 rgb(0 0 0 / 10%)',
            'margin':'5px 0'
        })
        const poperClassName = this.poperStyle().className
        this.containerVnode = h('div')
        this.poperVnode = h('div',{
            class:{
                [poperClassName]:true,
                'poper':true
            }
        },[this.containerVnode])
    }
    private _mount(){
        // this.softState = true
        const fullContainerDom = document.createElement('div')
        patch(fullContainerDom,this.poperVnode)
        document.body.appendChild(fullContainerDom)
    }

    destroy(){

    }

    public show(){
        if (this.softState){
            return
        }
        const newPoperVnode = cloneDeep(this.poperVnode)
        Object.assign(newPoperVnode,{
            data:{
                ...newPoperVnode.data,
                style:{
                    display:'block'
                }
            }
        })
        patch(this.poperVnode,newPoperVnode)
        this.softState = true
    }
    public hide(){
        console.log(this.softState)
        if (!this.softState){
            return
        }
        const newPoperVnode = cloneDeep(this.poperVnode)
        Object.assign(newPoperVnode,{
            data:{
                ...newPoperVnode.data,
                style:{
                    display:'none'
                }
            }
        })
        patch(this.poperVnode,newPoperVnode)
        this.softState = false
    }
    public resetList(datas){
        this.virtualList.resetList(datas)
    }
}
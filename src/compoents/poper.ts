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
            'visibility':'hidden',
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
            'margin':'5px 0',
            // 'display': 'none'
        })
        const poperClassName = this.poperStyle().className
        this.containerVnode = h('div')
        this.poperVnode = h('div',{
            class:{
                [poperClassName]:true,
                'poper':true
            },
            style:{
                // "display":'none'
            }
        },[this.containerVnode])
    }
    private _mount(){
        const fullContainerDom = document.createElement('div')
        patch(fullContainerDom,this.poperVnode)
        document.body.appendChild(fullContainerDom)
    }

    destroy(){

    }

    public show(){
        const newPoperVnode = cloneDeep(this.poperVnode)
        Object.assign(newPoperVnode,{
            data:{
                ...newPoperVnode.data,
                style:{
                    display:'block',
                    'visibility':'visible'
                }
            }
        })
        patch(this.poperVnode,newPoperVnode)
        this.poperVnode = newPoperVnode
    }
    public hide(){
        const newPoperVnode = cloneDeep(this.poperVnode)
        Object.assign(newPoperVnode,{
            data:{
                ...newPoperVnode.data,
                style:{
                    'display':'none',
                    'visibility':'hidden'
                }
            }
        })
        patch(this.poperVnode,newPoperVnode)
        this.poperVnode = newPoperVnode
    }
    public resetList(datas){
        this.virtualList.resetList(datas)
    }

    // 重置poper位置
    public resetPosition(){
        this._getTarget()
        const {top,height,left,width} = this.targetRect
        this.poperVnode.elm.style.top = `${top+height}px`
    }

    private createNoData(){
        const noDataSeatStyle = css({
            'color': '#999',
            'font-size': '14px',
            'text-align': 'center'
        })
        const noDataSeatClassName = noDataSeatStyle.className
        return h('div',{
            class:{
                [noDataSeatClassName]:true
            }
        },'无数据')
    }
}
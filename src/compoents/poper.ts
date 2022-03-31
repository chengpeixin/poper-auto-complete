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
    stateFlag = false
    width=200
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
        const {top,height,left} = this.targetRect
        this.poperStyle = css({
            'display': 'block',
            'visibility':'hidden',
            'position': 'absolute',
            'width':`${this.width}px`,
            'height':`200px`,
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

    public show(){
        if ( this.stateFlag ){
            return
        }
        const x = this.getXPosition()
        const newPoperVnode = cloneDeep(this.poperVnode)
        const { top } = this.targetRect
        Object.assign(newPoperVnode,{
            data:{
                ...newPoperVnode.data,
                style:{
                    'display':'block',
                    'visibility':'visible',
                    'left': `${x}px`,
                    'top':`${top+20}px`
                }
            }
        })
        patch(this.poperVnode,newPoperVnode)
        this.poperVnode = newPoperVnode
        this.stateFlag = true
    }
    public hide(){
        if ( !this.stateFlag ){
            return
        }
        const x = this.getXPosition()
        const newPoperVnode = cloneDeep(this.poperVnode)
        const { top } = this.targetRect
        Object.assign(newPoperVnode,{
            data:{
                ...newPoperVnode.data,
                style:{
                    'display':'none',
                    'visibility':'hidden',
                    'left': `${x}px`,
                    'top':`${top+20}px`
                }
            }
        })
        patch(this.poperVnode,newPoperVnode)
        this.poperVnode = newPoperVnode
        this.stateFlag = false
    }
    public resetList(datas){
        this.virtualList.resetList(datas)
    }

    // 重置poper位置
    public resetPosition(){
        const x = this.getXPosition()
        const {top,height} = this.targetRect
        this.poperVnode.elm.style.top = `${top+height}px`
        this.poperVnode.elm.style.left = `${x}px`
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

    // 获取当前应该的x位置
    private getXPosition(){
        this._getTarget()
        const {left} = this.targetRect
        const visibleAareaX = window.innerWidth
        const leftXPosition = this.width + left
        return leftXPosition > visibleAareaX ? (visibleAareaX - this.width):left
    }
}
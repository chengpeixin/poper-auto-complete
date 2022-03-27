import './less/index.less'
import Poper from './compoents/Poper'
import { attributesModule, classModule, eventListenersModule, h, init, propsModule, styleModule, VNode } from 'snabbdom'
import { isChrome } from './util/is'
import { trim } from 'lodash'
const testData = []
for(let i=0;i<100000;i++){
    testData.push({
        label: String(i),
        value: i
    })
}
/**
 *  @focus="handleFocus"
    @blur="softFocus = false"
    @keyup="managePlaceholder"
    @keydown="resetInputState"
    @keydown.down.prevent="handleNavigate('next')"
    @keydown.up.prevent="handleNavigate('prev')"
    @keydown.enter.prevent="selectOption"
    @keydown.esc.stop.prevent="visible = false"
    @keydown.delete="deletePrevTag"
    @keydown.tab="visible = false"
    @compositionstart="handleComposition"
    @compositionupdate="handleComposition"
    @compositionend="handleComposition"
 * 
 */

const patch  = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    attributesModule
])
export default class AutoComplete {
    target:HTMLDivElement
    targetSeat = document.createElement('div')
    // 
    menuVisibleOnFocus=false
    // 
    poper:Poper
    autoCompleteContainer:VNode
    autoCompleteTags:VNode
    autoCompleteInputFull:VNode
    autoCompleteInput:VNode
    // 处理中文输入时间接输入导致频繁触发input事件的flag
    onIndirectInput = false

    constructor(target:HTMLDivElement){
        this.target = target
        this.initVnode();
        this.initPoper()
    }
    private initVnode(){
        this.autoCompleteInput = h('input',{
            on:{
                'blur':()=>{
                    // this.poper.hide()
                },
                'focus':()=>{
                    this.poper.show()
                },
                'input':(e)=>{
                    if  (this.onIndirectInput){
                        return
                    }
                    const value = trim((e.target as HTMLInputElement).value)
                    var reg = new RegExp(value);
                    let resultDatas = []
                    if (value === ''){

                    } else {
                        resultDatas = testData.filter(item=>{
                            return reg.test(item.label)
                        })
                    }
                    this.poper.resetList(resultDatas)
                },
                'compositionstart':(e)=>{
                    this.onIndirectInput = true
                },
                'compositionend':(e)=>{
                    this.onIndirectInput = false
                    // chrome触发事件规则与其他浏览器不一致，所以需要单独判断
                    if ( isChrome() ){
                        e.target.dispatchEvent(new CustomEvent('input'))
                    }
                }
            },
            attrs:{
                type:'text'
            }
        })
        this.autoCompleteInputFull = h('div',{
            class:{
                'auto-complete-input-full':true
            }
        },[this.autoCompleteInput])
        this.autoCompleteTags = h('div',{
            class:{
                'auto-complete-tags':true
            }
        })
        this.autoCompleteContainer = h('div',{
            class:{
                'auto-complete':true
            },
            on:{
                'click':(e)=>{
                    e.stopPropagation()
                    if ( this.menuVisibleOnFocus ){
                        this.menuVisibleOnFocus = false
                    }
                    (this.autoCompleteInput.elm as HTMLInputElement).focus()
                }
            }
        },[
            this.autoCompleteTags,
            this.autoCompleteInputFull
        ])
        patch(this.targetSeat,this.autoCompleteContainer)
        this.target.innerHTML = ''
        this.target.appendChild(this.targetSeat)
    }
    private initPoper(){
        this.poper = new Poper(this.autoCompleteInput.elm as HTMLDivElement,testData)

    }
}

window['AutoComplete'] = AutoComplete
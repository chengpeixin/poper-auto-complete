import './less/index.less'
import Poper from './compoents/Poper'
import { attributesModule, classModule, eventListenersModule, h, init, propsModule, styleModule, VNode } from 'snabbdom'
import { isChrome } from './util/is'
import { trim } from 'lodash'
import { Option } from './types'
import eventBus from './util/EventBus'
import { css } from '@stitches/core'
import { cloneDeep } from 'lodash'
const testData:Option[] = []
for(let i=0;i<10;i++){
    testData.push({
        label: `${i}hcdfj`,
        value: String(i)
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
    poper:Poper
    autoCompleteContainer:VNode
    autoCompleteTags:VNode
    autoCompleteInputFull:VNode
    selectInputVnode: VNode
    inputInnerVnode: VNode
    // 处理中文输入时间接输入导致频繁触发input事件的flag
    onIndirectInput = false

    // 当前已选择的key
    selectd=[]
    finalDatas = []

    constructor(target:HTMLDivElement){
        this.target = target
        this.setupFinalDatas(testData)
        this.initVnode();
        this.initPoper()
        eventBus.on('click-label-item',(e:Event)=>{
            const {value,label,index} = (e.target as HTMLDivElement).dataset
            this.selectd.push({
                value,
                label,
                index:Number(index)
            })
            this.fitlerShouldShowItemNode()
            const tagVnode = this.createTags()
            patch(this.autoCompleteTags,tagVnode)
            this.autoCompleteTags = tagVnode
            this.poper.resetList(this.finalDatas)
            this.resetInputHeight()
            this.poper.resetPosition()
        })
    }
    private setupFinalDatas (finalDatas:Option[]) {
        this.finalDatas =  cloneDeep(finalDatas).map((option:Option,index)=>{
            const opt = Object.create(null)
            return Object.assign(opt,{
                ...option,
                index,
                effective:true
            })
        })
    }
    private initVnode(){
        this.autoCompleteTags = this.createTags()
        this.autoCompleteInputFull = this.createSuffix()
        this.autoCompleteContainer = h('div',{
            class:{
                'auto-complete':true
            },
            style:{
                'width': '240px',
                'display':'inline-block',
                'position':'relative'
            },
            on:{
                'click':(e)=>{
                    e.stopPropagation()
                    if ( this.menuVisibleOnFocus ){
                        this.menuVisibleOnFocus = false
                    }
                    (this.selectInputVnode.elm as HTMLInputElement).focus()
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
        this.poper = new Poper(this.inputInnerVnode.elm as HTMLDivElement,testData)
    }
    
    // 创建tags
    private createTags(){
        const tagStyle = css({
            'background-color':'#f4f4f5',
            'border-color': '#e9e9eb',
            'color':'#909399',
            'box-sizing':'border-box',
            'margin':'2px 0 2px 6px',
            'display':'flex',
            'max-width':'100%',
            'align-items':'center',
            'height': '24px',
            'padding': '0 8px',
            'line-height': '22px',
            'font-size':'12px',
            'border': '1px solid #d9ecff',
            'border-radius': '4px',
            'white-space': 'nowrap'
        })
        const closeIconStyle = css({
            'color':'#909399',
            'background-color':'#c0c4cc',
            'top':'0',
            'flex-shrink':'0',
            'transform':'scale(.8)',
            'border-radius':'50%',
            'text-align':'center',
            'position':'relative',
            'cursor':'pointer',
            'font-size':'12px',
            'height':'16px',
            'width':'16px',
            'line-height':'16px',
            'vertical-align':'middle',
            'right':'-5px',
            'speak':'none',
            'font-style':'normal',
            'font-weight':'400',
            'font-variant':'normal',
            'text-transform':'none',
            'display':'inline-block',
            '-webkit-font-smoothing':'antialiased',
            '&:hover':{
                'color':'#fff',
                'background-color':'#909399'
            }
        })
        const closeIconClassName = closeIconStyle().className
        const tagClassName = tagStyle().className
        const createCloseIconVnode = (option:Option) => {
            return h('span',{
                on:{
                    click:(e)=>{
                        const value = (e.target as HTMLElement).dataset['value']
                        const index = this.selectd.findIndex(item=>item.value == value)
                        if (index!==-1){
                            // 如果大数据，这里应该减少计算
                            const option = this.selectd[index]
                            this.finalDatas.splice(option.index,0,option)
                            this.selectd.splice(index,1)
                            this.fitlerShouldShowItemNode()
                            const newTagsVnode = this.createTags()
                            patch(this.autoCompleteTags,newTagsVnode)
                            this.autoCompleteTags = newTagsVnode
                            this.poper.resetList(this.finalDatas)
                            this.resetInputHeight()
                            this.poper.resetPosition()
                        }
                    }
                },
                attrs:{
                    'data-value': option.value
                },
                class:{
                    [closeIconClassName]:true
                }
            },'×')
        }
        const tags = this.selectd.map((item:Option)=>{
            return h('span',{
                class:{
                    [tagClassName]:true
                }
            },[
                h('span',{},item.label),
                createCloseIconVnode(item)
            ])
        })
        const selectInputStyle = css({
            'flex-grow': '1',
            'width': '0.0961538%',
            'max-width': '198px',
            'border': 'none',
            'outline': 'none',
            'padding': '0',
            'margin-left': '15px',
            'color': '#666',
            'font-size': '14px',
            'appearance': 'none',
            'height': '28px',
            'background-color': 'transparent'
        })
        const selectInputClassName = selectInputStyle().className
        const selectInputVnode = h('input',{
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
                    if (value === ''){
                        this.finalDatas = testData
                    } else {
                        this.finalDatas = testData.filter(item=>{
                            return reg.test(item.label)
                        })
                    }
                    this.fitlerShouldShowItemNode()
                    this.poper.resetList(this.finalDatas)
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
            class:{
                [selectInputClassName]:true
            },
            attrs:{
                type:'text',
                autocomplete: 'off',
                placeholder:'',
                tabindex: '-1'
            }
        })
        this.selectInputVnode = selectInputVnode
        return h('div',{
            style:{
                'display':'flex',
                'width':'100%',
                'max-width':'208px',
                'position':'absolute',
                'line-height': 'normal',
                'white-space': 'normal',
                'z-index': '1',
                'top': '50%',
                'transform': 'translateY(-50%)',
                'align-items': 'center',
                'flex-wrap': 'wrap'
            }
        },[
            h('span',{
                style:{
                    display:'contents'
                }
            },[
                ...tags
            ]),
            selectInputVnode
        ])
    }

    // 创建suffix
    private createSuffix(){
        const inputInnerStyle = css({
            'cursor': 'pointer',
            'padding-right':'30px',
            '-webkit-appearance':'none',
            'background-color': '#fff',
            'background-image': 'none',
            'border-radius': '4px',
            'border': '1px solid #dcdfe6',
            'box-sizing': 'border-box',
            'color': '#606266',
            'display': 'inline-block',
            'font-size': 'inherit',
            'height': '40px',
            'line-height': '40px',
            'outline': 'none',
            'padding': '0 15px',
            'transition': 'border-color .2s cubic-bezier(.645,.045,.355,1)',
            'width': '100%'
        })
        const inputInnerClassName = inputInnerStyle().className
        const inputSuffixStyle = css({
            'display':'block',
            'position': 'relative',
            'font-size': '14px',
            'width': '100%'
        })
        const inputInnerVnode = h('input',{
            class:{
                [inputInnerClassName]:true
            },
            attrs:{
                readonly: 'readonly',
                tabindex: '-1',
                type: 'text',
                autocomplete: 'off',
                placeholder: ''
            }
        })
        this.inputInnerVnode = inputInnerVnode
        const inputSuffixClassName = inputSuffixStyle().className
        const inputSuffixVnode = h('div',{
            class:{
                [inputSuffixClassName]: true
            }
        },[
            inputInnerVnode
        ])

        return inputSuffixVnode
    }
    
    // 将选中的和当前数据进行过滤
    private fitlerShouldShowItemNode(){
        const  { finalDatas, selectd } = this
        const splitDatas = []
        for( let i = 0; i<selectd.length; i++ ){
            const selectdItem = selectd[i]
            const finalIndex = finalDatas.findIndex(finaItem=>{
                return selectdItem.value == finaItem.value
            })
            if (finalIndex!==-1){
                splitDatas.push(finalIndex)
            }
        }
        for (let i =0;i<splitDatas.length;i++){
            const finalIndex = splitDatas[i]
            this.finalDatas.splice(finalIndex,1)
            i=i+1;
        }
        this.finalDatas.sort((a,b)=>a.index-b.index)
    }

    // 重置选择器框高度
    private resetInputHeight(){
        const tagsHeight = Math.round(this.autoCompleteTags.elm.getBoundingClientRect().height)
        const initialInputHeight = 40
        let inputHeight = initialInputHeight
        if (this.selectd.length !== 0){
            inputHeight = Math.max(
                tagsHeight > initialInputHeight? tagsHeight + (tagsHeight>initialInputHeight? 6 : 0): initialInputHeight
            )
        }
        this.inputInnerVnode.elm.style.height = `${inputHeight}px`
    }
}

window['AutoComplete'] = AutoComplete
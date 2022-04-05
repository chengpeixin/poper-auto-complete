// import './less/index.less'
// @ts-ignore
import { css as css } from '@stitches/core'
import Poper from './compoents/Poper'
import { attributesModule, classModule, eventListenersModule, h, init, propsModule, styleModule, VNode } from 'snabbdom'
import { isChrome } from './util/is'
import { trim,cloneDeep } from 'lodash'
import { Option, Opts } from './types'
import eventBus from './util/EventBus'
import clickoutside from './util/clickoutside'

const publicEvent = "@@public"
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
    // 控制poper是否展示
    visible=false
    // 
    softFocus=false
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
    options = []
    opts:Opts
    // 当前是否搜索状态
    isClickLabel=false
    constructor(target:HTMLDivElement,opts:Opts){
        this.target = target
        this.opts = opts
        this.setupFinalDatas(opts.options)
        this.initVnode();
        this.initPoper()
        eventBus.on('click-label-item',(e:Event)=>{
            const {value,label,index} = (e.target as HTMLDivElement).dataset
            this.selectd.push({
                value,
                label,
                index:Number(index)
            })
            this.isClickLabel = true
            this.visible = true
            this.menuVisibleOnFocus = true
            // 修改数据并patch tags
            this.fitlerShouldShowItemNode()
            const tagVnode = this.createTags()
            patch(this.autoCompleteTags,tagVnode)
            this.autoCompleteTags = tagVnode
            // 重置待选项列表
            this.poper.resetList(this.finalDatas)
            // 重置高度
            this.resetInputHeight()
            // 重置poper位置
            this.poper.resetPosition()
            // 重置focus事件
            this.setSoftFocus()
            eventBus.emit(`${publicEvent}-change`,this.selectd)
        })
    }

    // 对传入数据进行初始化操作
    private setupFinalDatas (finalDatas:Option[]) {
        this.options = finalDatas
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
                'width': this.opts.width,
                'display':'inline-block',
                'position':'relative'
            },
            on:{
                'click': this.toggleMenu.bind(this)
            }
        },[
            this.autoCompleteTags,
            this.autoCompleteInputFull
        ])
        patch(this.targetSeat,this.autoCompleteContainer)
        this.target.innerHTML = ''
        clickoutside(this.autoCompleteContainer.elm as HTMLElement,()=>{
            setTimeout(()=>{
                const selectInputDom = this.selectInputVnode.elm as HTMLInputElement
                // 判断是否点击的是父级元素
                if ( !this.isClickLabel ){
                    this.poper.hide()
                    selectInputDom.value = ''
                    this.menuVisibleOnFocus = false
                    this.visible = false
                    this.resetShouldItemByfitlerValue()
                    this.fitlerShouldShowItemNode()
                    this.poper.resetList(this.finalDatas)
                    selectInputDom.blur()
                } else {
                    this.isClickLabel = false
                }
            },50)
        })
        this.target.appendChild(this.targetSeat)
    }
    private initPoper(){
        this.poper = new Poper(this.selectInputVnode.elm as HTMLDivElement,this.finalDatas)
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
            'height': '30px',
            'padding': '0 8px',
            'line-height': '22px',
            'font-size':'14px',
            'border': '1px solid #d9ecff',
            'border-radius': '4px',
            'white-space': 'nowrap'
        })
        const closeIconStyle = css({
            'padding':'3px',
            'color':'#909399',
            'background-color':'#c0c4cc',
            'top':'0',
            'flex-shrink':'0',
            'transform':'scale(.8)',
            'border-radius':'50%',
            'text-align':'center',
            'position':'relative',
            'cursor':'pointer',
            'font-size':'14px',
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
                    click: this.removeTag.bind(this)
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
                    if ( !this.visible ){
                        this.poper.hide()
                    }
                },
                'focus':this.handlerFocus.bind(this),
                'input':(e)=>{
                    if  (this.onIndirectInput){
                        return
                    }
                    this.resetShouldItemByfitlerValue()
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
                'max-width': this.opts.width,
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
            'height': `${this.opts.height}px`,
            'line-height': `${this.opts.height}px`,
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
            },
            on:{
                'focus':this.handlerFocus.bind(this)
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

    // 根据当前fltler输入值过滤
    private resetShouldItemByfitlerValue(){
        const value = trim(this.selectInputVnode.elm && (this.selectInputVnode.elm as HTMLInputElement).value || '')
        var reg = new RegExp(value);
        if (value === ''){
            this.finalDatas = this.options
        } else {
            this.finalDatas = this.options.filter(item=>reg.test(item.label))
        }
    }


    // 触发focus
    private handlerFocus (){
        if ( !this.visible ){
            this.poper.show()
        }
        this.visible = true
        // if ( !this.softFocus ){
        //     if ( !this.visible ){
        //         this.menuVisibleOnFocus = true
        //     }
        //     this.visible = true
        // } else {
        //     this.softFocus = false
        // }
    }


    private setSoftFocus(){
        // this.softFocus = true
        this.selectInputVnode.elm && (this.selectInputVnode.elm as HTMLInputElement).focus()
    }

    // 点击选择框控件
    private toggleMenu(e){
        e.stopPropagation()
        if ( !this.visible ){
            (this.selectInputVnode.elm as HTMLInputElement).focus()
        }
    }

    // 从tags中删除
    private removeTag(e:Event) {
        e.stopPropagation();
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
            eventBus.emit(`${publicEvent}-change`,this.selectd)
        }
    }
    

    // 重置选择器框高度
    private resetInputHeight(){
        const tagsHeight = Math.round((this.autoCompleteTags.elm as HTMLElement).getBoundingClientRect().height)
        const initialInputHeight = 40
        let inputHeight = initialInputHeight
        if (this.selectd.length !== 0){
            inputHeight = Math.max(
                tagsHeight > initialInputHeight? tagsHeight + (tagsHeight>initialInputHeight? 6 : 0): initialInputHeight
            )
        }
        (this.inputInnerVnode.elm as HTMLInputElement).style.height = `${inputHeight}px`
    }

    // 获取当前输入框内容
    private getFitlerValue (){
        return trim((this.selectInputVnode.elm as HTMLInputElement).value)
    }

    // 供外部调用
    public on(eventName:string,cb:Function){
        eventBus.on(`${publicEvent}-${eventName}`,cb)
    }
}
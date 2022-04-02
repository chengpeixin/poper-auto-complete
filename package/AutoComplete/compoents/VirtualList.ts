import { h,init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    attributesModule,
    VNode
} from 'snabbdom'
import { css } from '@stitches/core';
import { CssComponent } from '@stitches/core/types/styled-component';
import eventBus from '../util/EventBus';
import { Option } from './../types'

const patch  = init([
    classModule,
    propsModule,
    styleModule,
    attributesModule,
    eventListenersModule
])
export default class VirtualList {
    screenHeight:number
    start=0
    itemSize=30
    startOffset=0
    listHeight=0

    end: null| number
    datas:Option[]

    target:VNode
    containerVnode: VNode
    infiniteListVnode: VNode
    itemsVnode: VNode[]

    // css in js type
    containerCss: CssComponent
    phantomCss: CssComponent
    infiniteListCss: CssComponent
    infiniteListItemCss: CssComponent

    isInit=false
    constructor(datas:Option[],target){
        this.datas = datas
        this.target = target
        this.isInit = true
        this.initVnode()
    }

    initVnode(){
        this.listHeight = this.datas.length * this.itemSize
        this.screenHeight = this.target.elm.parentElement.clientHeight||300;
        // 需要初始化滚动所需
        this.start = 0
        this.end = this.start + Math.ceil(this.screenHeight / this.itemSize)
        const visibleDatas = this.visibleData()
        this.containerCss = css({
            'height': '100%',
            'overflow': 'auto',
            'position': 'relative',
            '-webkit-overflow-scrolling': 'touch'
        })

        const containerClassName = this.containerCss().className
        this.phantomCss = css({
            'position': 'absolute',
            'left': 0,
            'top': 0,
            'right': 0,
            'z-index': -1,
            height:`${this.listHeight}px`
        })
        const phantomClassName = this.phantomCss().className

        this.infiniteListCss = css({
            left: 0,
            right: 0,
            top: 0,
            position: 'absolute',
            'text-align': 'center',
        })
        const infiniteListClassName = this.infiniteListCss().className

        this.infiniteListItemCss = css({
            color: '#555',
            'font-size': '14px',
            'cursor':'pointer',
            'box-sizing': 'border-box',
            'height':`${this.itemSize}px`,
            'line-height':`${this.itemSize}px`,
            'text-align': 'left',
            'padding':'0px 4px',
            '&:hover':{
                'background-color': '#f5f7fa'
            }
        })

        const infiniteListItemClassName = this.infiniteListItemCss().className
        // lable
        this.itemsVnode = visibleDatas.map((item:Option)=>{
            return h('div',{
                class:{
                    [infiniteListItemClassName]: true
                },
                attrs:{
                    'data-value': item.value,
                    'data-label': item.label,
                    'data-index': item.index
                },
                on:{
                    click:this.clickListItemHandler
                }
            },item.label)
        })
        // 滚动列表
        this.infiniteListVnode = h('div',{
            class:{
                'infinite-list': true,
                [infiniteListClassName]: true
            }
        },this.itemsVnode)
        // 容器
        this.containerVnode = h('div',{
            on:{
                scroll:this.scrollEvent.bind(this)
            },
            class:{
                'infinite-list-container':true,
                [containerClassName]: true
            }
        },[
            h('div',{
                class: {
                    'infinite-list-phantom': true,
                    [phantomClassName]: true
                }
            },''),
            this.infiniteListVnode
        ])
        patch(this.target,this.containerVnode)
        this.target = this.containerVnode
    }

    // 滚动事件
    scrollEvent(e:Event){
        //当前滚动位置
        let scrollTop = (e.target as HTMLDivElement).scrollTop;
        // let scrollTop = .scrollTop;
        const infiniteListItemClassName = this.infiniteListItemCss().className
        const infiniteListClassName = this.infiniteListCss().className
        //此时的开始索引
        this.start = Math.floor(scrollTop / this.itemSize);
        //此时的结束索引
        this.end = this.start + Math.ceil((this.screenHeight / this.itemSize))
        //此时的偏移量
        this.startOffset = scrollTop - (scrollTop % this.itemSize);
        // 在这里pathch整个渲染列表
        const currentVisibleDatas = this.visibleData();
        // 为避免在scroll事件中频繁创建dom开销，虚拟列表项全部使用vnode
        const currentItemsVnode = currentVisibleDatas.map((item:Option)=>{
            return h('div',{
                class:{
                    [infiniteListItemClassName]: true
                },
                attrs:{
                    'data-value': item.value,
                    'data-label': item.label,
                    'data-index': item.index
                },
                on:{
                    click:this.clickListItemHandler
                }
            },item.label)
        })
        const currentInfiniteListVnode = h('div',{
            class:{
                'infinite-list': true,
                [infiniteListClassName]: true
            },
            style:{
                transform:`translate3d(0,${this.startOffset}px,0)`
            }
        },currentItemsVnode)

        patch(this.infiniteListVnode,currentInfiniteListVnode)
        this.infiniteListVnode = currentInfiniteListVnode
    }
    // 获取真实展示列表数据
    public visibleData(){
        return this.datas.slice(
            this.start,
            Math.min(this.end, this.datas.length)
          );
    }

    // 点击某一项item
    public clickListItemHandler(e:Event){
        eventBus.emit('click-label-item',e)
    }

    // 根据数据重置虚拟列表
    public resetList(datas){
        // 重置datas
        this.datas = datas
        this.initVnode()
    }
}
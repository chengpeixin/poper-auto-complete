import { h,init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    VNode
} from 'snabbdom'
import { css } from '@stitches/core';
import { CssComponent } from '@stitches/core/types/styled-component';
const patch  = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule
])
export default class VirtualList {
    screenHeight:number
    start=0
    end: null| number
    datas:[]
    target:HTMLDivElement
    containerVnode: VNode
    itemSize=20
    startOffset=0
    listHeight=0
    infiniteListVnode: VNode
    itemsVnode: VNode[]

    // css in js type
    containerCss: CssComponent
    phantomCss: CssComponent
    infiniteListCss: CssComponent
    infiniteListItemCss: CssComponent
    constructor(datas,target){
        this.datas = datas
        this.target = target
        this.initDom()
    }

    initDom(){
        this.listHeight = this.datas.length * this.itemSize
        this.screenHeight = this.target.parentElement.clientHeight;
        // 需要初始化滚动所需
        this.start = 0
        this.end = this.start + Math.ceil(this.screenHeight / this.itemSize)
        const visibleDatas = this.visibleData()
        this.containerCss = css({
            height: '100%',
            overflow: 'auto',
            position: 'relative',
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
            padding: '3px',
            color: '#555',
            'font-size': '13px',
            'cursor':'pointer',
            'box-sizing': 'border-box',
            'border-bottom': '1px solid #999',
            'height':`${this.itemSize}px`,
            '&:hover':{
                backgroundColor: 'SkyBlue'
            }
        })

        const infiniteListItemClassName = this.infiniteListItemCss().className

        this.itemsVnode = visibleDatas.map(item=>{
            return h('div',{
                class:{
                    [infiniteListItemClassName]: true
                }
            },item.label)
        })

        this.infiniteListVnode = h('div',{
            class:{
                'infinite-list': true,
                [infiniteListClassName]: true
            }
        },this.itemsVnode)

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
    }

    // 滚动事件
    scrollEvent(){
        //当前滚动位置
        let scrollTop = document.querySelector('.infinite-list-container').scrollTop;
        const infiniteListItemClassName = this.infiniteListItemCss().className
        const infiniteListClassName = this.infiniteListCss().className
        //此时的开始索引
        this.start = Math.floor(scrollTop / this.itemSize);
        //此时的结束索引
        this.end = this.start + Math.ceil((this.screenHeight / this.itemSize))
        const visibleDatas = this.visibleData();
        if ( visibleDatas.length === 0 ){
            return
        }
        //此时的偏移量
        this.startOffset = scrollTop - (scrollTop % this.itemSize);
        // 在这里pathch整个渲染列表
        const currentItemsVnode = this.visibleData().map(item=>{
            return h('div',{
                class:{
                    [infiniteListItemClassName]: true
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
    }

    // 偏移量对应的style
    getTransform(){
        return `translate3d(0,${this.startOffset}px,0)`
    }
    // 获取真实显示列表数据
    public visibleData(){
        
        return this.datas.slice(
            this.start,
            Math.min(this.end, this.datas.length)
          );
    }
}
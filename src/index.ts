// @ts-nocheck
import AutoComplete from './../package/AutoComplete'
import { debounce } from 'lodash'
import { isMac } from './util/is'
import selectJSON from './data/select.json'
import allNews from './data/content.json'
// https://news.sina.com.cn/china/
window.addEventListener('load',init)

export function init(){
    let selectds = []
    var autoComplete = new AutoComplete(document.querySelector('#xxx'),{
        options:selectJSON,
        width:'100%',
        height:50,
        selectionClose: true
    })

    // state状态，1正常展示分页，2加载中，3无数据
    var paging = {
        current:1,
        pageSize:10,
        state:'1'
    }

    // autoComplete内置事件
    autoComplete.on('change',debounce(function (data) {
        selectds = data
        setDisabled(selectds.length===0)
        searchNewsHandler()
    },300))

    // 点击搜索按钮
    document.querySelector('.search-btn').addEventListener('click',debounce(searchNewsHandler,300))

    function searchNewsHandler () {
            const fullScroll = document.querySelector('.scroll')
            fullScroll.innerHTML = ''
            hideNextText()
            showLoading()
            Object.assign(paging,{
                current:1,
                pageSize:10
            })
            loadNewsData()
    }

    loadNewsData()

    // 懒加载图片
    function lazyload() {
        const imgLazyElements = document.querySelectorAll('img[lazy]')
        Array.prototype.forEach.call(imgLazyElements,function(item,index){
            var src = item.dataset.src
            if (src===''){
                return
            }
            var rect = item.getBoundingClientRect()
            if ( rect.bottom>=0 && rect.top < document.documentElement.clientHeight ){
                var img = new Image()
                img.src = src
                img.onload = function (){
                    item.src = img.src
                    // 性能优化，移除lazy标记
                    item.removeAttribute('lazy')
                    startLoadTransition(item)
                    // 删除骨架屏
                    removeSkeleton(item.parentElement)
                    img = null
                }
            }
        })
    }

    window.addEventListener("scroll",debounce(lazyload,100))
    document.querySelector('.next-page').addEventListener('click',function(){
        if ( paging.state === "2" ){
            return
        }
        hideNextText()
        showLoading()
        loadNewsData()
    })

    // 加载新闻列表
    function loadNewsData(){
        Object.assign(paging,{
            state: "2"
        })
        setUpPaddingByState()
        // 模拟接口返回时间
        setTimeout(function(){
            const currentData = findNewsByPageAndType()
            if ( currentData.length === 0 ){
                Object.assign( paging, {
                    current:1,
                    state: "3"
                })
            } else {
                Object.assign( paging, {
                    state: "1"
                })
            }
            for ( let i =0; i < currentData.length; i++ ){
                const el = currentData[i]
                Array.prototype.forEach.call(createNewsItem({
                    title: el.title,
                    text: el.content,
                    src: el.img,
                    date: el.date
                }),function(node){
                    document.querySelector('.scroll').appendChild(node)
                    // 添加后主动触发
                    dispatchLazyImg()
                })
            }
            Object.assign( paging, {
                current:paging.current + 1,
                pageSize:10
            })
            setUpPaddingByState()
            console.log(`当前第${paging.current-1}页`)
        },1000)
    }
    
    // 主动触发图片加载
    function dispatchLazyImg(){
        var evt = window.document.createEvent('UIEvents');
        evt.initUIEvent('scroll', true, false, window, 0); 
        window.dispatchEvent(evt);
    }

    // 创建节点且返回子节点
    function createNewsItem ({
        title,
        text,
        src,
        date
    }){
        const placeholder = document.createElement('div')
        const ismac = isMac()
        placeholder.innerHTML = `
        <div class="result-item-fullbox">
            <div class="result-item">
                <div class="result-item-content">
                    <div class="result-item-content-title">${title}</div>
                    <div class="${ismac?'mac-text':''} result-item-content-text">${text}</div>
                </div>
                <div class="result-item-img skeleton">
                    <img lazy="true" data-src="${src}">
                </div>
                <div class="result-item-date">${date}</div>
            </div>
        </div>`;
        return placeholder.children
    }

    // 开始过渡动画
    function startLoadTransition(imgTarget){
        // 设置动画
        imgTarget.style.opacity = '1'
    }

    // 剔除图片加载骨架图加载特效
    function removeSkeleton(target){
        target.classList.remove('skeleton')        
    }

    // 设置不可搜索状态
    function setDisabled(state:boolean){
        const btn = document.querySelector('.search-btn')
        if ( state ){
            btn.setAttribute('disabled','disabled')
        } else {
            btn.removeAttribute('disabled')
        }
    }

    // 根据分页和类型查询新闻列表
    function findNewsByPageAndType () {
        if (selectds.length === 0){
            return pagination(paging.current,paging.pageSize,allNews)
        }
        const selectdsVals = selectds.map(function(el){
            return el.value
        })
        const data = allNews.filter(function(el){
            return selectdsVals.indexOf(el.type) > -1
        })
        return pagination(paging.current,paging.pageSize,data)
    }
    // 分页查询
    function pagination(pageNo, pageSize, array) {
        var offset = (pageNo - 1) * pageSize;
        return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    }

    // 数据为空 隐藏分页，展示无数据状态
    function emptyDataHandler(datas){
        if ( datas.length !== 0){
            document.querySelector('.next-page').style.display = 'block'
            document.querySelector('.empty-data') && document.querySelector('.empty-data').remove()
            return
        }
        if ( datas.length === 0 && paging.current === 1 ){
            setEmptyData()
            return
        }
        if (datas.length === 0 && paging.current -1 !== 1){
            setPaddingEmptyData()
        }
    }

    function setEmptyData(){
        document.querySelector('.scroll').innerHTML = `<div class="empty-data">无数据...</div>`
        document.querySelector('.next-page').style.display = 'none'
    }

    function setPaddingEmptyData(){
        const dom =  document.createElement('div')
        dom.innerHTML = '没有更多数据了'
        document.querySelector('body').appendChild(dom)
        document.querySelector('.next-page').style.display = 'none'
    }

    // 随机返回图片地址
    function getRandomSrc(){
        const srcs = [
            'https://t7.baidu.com/it/u=2291349828,4144427007&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=1819248061,230866778&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=1092574912,855301095&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=376303577,3502948048&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=810585695,3039658333&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=1700588201,792130339&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=2671101745,1413589787&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=2869268957,1721811479&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=1557229360,443641844&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=3078295664,4026667001&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=805456074,3405546217&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=3069651952,3707858927&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=3902551096,3717324701&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=4139900776,3950105079&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=3990204032,3996447558&fm=193&f=GIF',
            'https://t7.baidu.com/it/u=3876201379,2104650373&fm=193&f=GIF'
        ]
        return srcs[Math.floor(Math.random()*srcs.length)]
    }

    // 获取随机时间
    function getRandomDateText(){
        var dateText = [
            "4周前",
            "1周前",
            "2周前",
            "3周前",
            "1月前",
            "2月前",
            "3月前",
            "4月前",
            "5月前",
            "6月前",
            "7月前",
            "8月前",
            "一年前",
            "二年前",
            "三年前",
            "四年前",
            "五年前",
            "六年前",
            "七年前",
            "八年前",
            "九年前",
            "2022年4月01日",
            "2022年3月28日",
            "2022年3月29日",
            "2022年3月30日",
            "2022年3月31日",
        ]
        return dateText[Math.floor(Math.random()*dateText.length)]
    }

    // 获取随机文字
    function getRandomContentText (){
        const texts = [
            "海外网4月1日电 综合彭博社、俄新社1日报道，根据彭博亿万富翁指数（BBI），自2022年年初以来，俄罗斯富豪的总资产缩水了501亿美元，仅为2994.7亿美元。俄罗斯总统新闻秘书佩斯科夫此前表示，西方国家对俄罗斯商人进行制裁是“强盗行为”。",
            "近日，@浙江理工大学 收到一封来自宁波市税务局的感谢信，信上感谢了该校计算机系教授沈炜在一起重大骗税案中所作的贡献。通过实验判断“姿态稳定控制器”的芯片与说明书上的功能不匹配，沈教授找到了案件的关键性证据，为国家挽回27.73亿元的重大损失。此前，沈教授还协助公安破获了多起银行卡诈骗案件。（人民日报）",
            `据连塔网1日报道，俄罗斯总统普京的发言人佩斯科夫说，某些媒体有关普京罹患甲状腺癌并做过手术的报道是“臆想和谎言”。　　报道称，莫斯科回声电台前总编辑韦涅季克特在社交平台上发文说：“被问及‘我理解是否正确，即普京没有得癌症？’，佩斯科夫回答说‘正确’。”`,
            `去年7月，中企希望收购英国最大芯片生产商的计划引发各方关注，部分英国反华政客更是借此炒作“国家安全”话题，意图搅黄此事。但事实表明，他们的尝试并未奏效。　　当地时间4月1日，美国政治新闻网（Politico）欧洲版发文称，英国政府已经悄悄批准中企闻泰科技的荷兰子公司安世半导体（Nexperia）收购英国芯片生产商Newport Wafer Fab（NWF）的计划。`,
            `北京商报 “昨晚特别忐忑，就像一个学生没考好试，拿成绩单要给父母看一样。我完全能够理解股东各种各样的情绪，不满也好、失望也好、困惑也好、关切也好，我感同身受。”　　3月31日当天，万科董事会主席郁亮率先以“检讨”开场。`,
            `围绕纯电动汽车（EV）的高性能化，可对马达和电池进行有效热控制的技术成了新的竞争核心。日本电装（DENSO）等企业正加紧把使用制冷剂的新系统推向实用化。席卷全球纯电动车市场的美国特斯拉正是注重热控制技术的企业之一。该公司凭借自主研发的系统设备领跑该领域，该设备用一个“8条腿”的奇妙零部件来冷却整个车辆。围绕纯电动车主导权的开发竞争正在不断升温。`,
            "美国总统拜登3月31日发布消息称，将在今后6个月里每天平均追加释放100万桶战略石油储备，总计相当于1亿8000万桶。其他国家也可能采取一致行动，释放3000万～5000万桶。目的是抑制因俄罗斯进攻乌克兰而居高不下的汽油价格。",
            `美国总统拜登3月31日发布消息称，将在今后6个月里每天平均追加释放100万桶战略石油储备，总计相当于1亿8000万桶。其他国家也可能采取一致行动，释放3000万～5000万桶。目的是抑制因俄罗斯进攻乌克兰而居高不下的汽油价格。`,
            `乌贼及康吉鳗等是做寿司的标准食材。但日本的鱼贝类捕获量正在严重减少。背景是全球滥捕。也有调查结果表明，再加上气候变化下的海水温度上升，3成以上海洋水产品将来有可能从海洋消失。专家认为，为了保护日本引以为傲的饮食文化，“需要制定保护水产资源的国际规则”。`,
            `日本“全国秋刀鱼棒受网（舷提网）渔业协同组合”（东京港区）12月10日公布了截至11月底秋刀鱼舷提网捕捞的捕获量情况。日本全国共捕获1万7899吨，比过去最低的上年同期减少了34％。秋刀鱼的渔场不往日本近海靠近，11月恶劣天气也一直持续，很多渔船放弃出海捕鱼。`,
            `志田富雄：欧洲的布伦特期货在3月7日逼近140美元/桶，而之后一度跌破100美元，剧烈的价格波动日趋突出。乌克兰局势的前景难以预料，这种被供给隐忧动摇的局面在持续。大宗商品市场的行情和经济环境与1970年代相比明显改变，需要警惕2021世纪型石油危机给世界经济带来的风险。`,
            `由于俄罗斯进攻乌克兰，市场相关人士开始调整经济展望。美国穆迪分析公司（Moody’s Analytics）认为，冲突长期化将会导致原油价格上涨至每桶150美元，欧洲的季度经济增长率将暂时陷入负增长。据英国牛津经济研究院估算，此次冲突将拉低世界经济增长率0.2％。通货膨胀速度加快、世界贸易停滞、市场混乱三个因素将成为全球经济的沉重负担。`,
            `3月28日，日美欧等七国集团（G7）的能源部长举行紧急线上会议，就拒绝以卢布支付俄罗斯天然气费用达成一致。俄罗斯总统普京此前宣布将日美欧等“不友好国家”的支付方式限定为卢布。`,
            `东芝已开始讨论英国投资基金CVC Capital Partners的收购提议。CVC似乎提出以高出4月6日收盘价（3830日元）约3成的每股5000日元进行收购。这相当于将东芝的股票估值定为2.3万亿日元左右，不过东芝的估值受到持有4成股权的半导体存储芯片企业铠侠控股（原东芝存储器控股）估值的左右。`,
            `脱碳化浪潮、汽车产业的电动化转型，疫情对半导体的产业链造成巨大冲击——近年来，世界的经济和产业环境正在发生巨变，众多日本企业为寻求新的发展正调整以往战略或走向转型之路。比如丰田终于开始向纯电动汽车转舵、索尼抢在苹果之前宣布涉足纯电动汽车……日经中文网对一年来在本网已刊登的深入剖析和研究日本企业的文章进行了汇总，以飨读者。`
        ]
        return texts[Math.floor(Math.random()*texts.length)]
    }

    // 获取随机标题
    function getRandomTitle(){
        var titles = [
            "亚马逊",
            "Alphabet",
            "京东 (网站)",
            "Facebook.73亿",
            "腾讯",
            "阿里巴巴集团",
            "Netflix",
            "百度",
            "Booking Holdings",
            "Salesforce.com",
            "唯品会",
            "Expedia公司",
            "eBay",
            "美团点评"
        ]
        return titles[Math.floor(Math.random()*titles.length)]
    }

    function setUpPaddingByState () {
        switch (paging.state){
            case "1":
                showNextText()
                hideLoading()
                hideEmptyData()
            break;
            case "2":
                showLoading()
                hideNextText()
                hideEmptyData()
            break;
            case "3":
                showEmptyData()
                hideLoading()
                hideNextText()
            break;
        }
    }

    function showLoading (){
        (document.querySelector('.spinner') as HTMLDivElement).style.display = 'block'
    }
    function hideLoading (){
        (document.querySelector('.spinner') as HTMLDivElement).style.display = 'none'
    }
    function showNextText(){
        (document.querySelector('.next-page-text') as HTMLDivElement).style.display = 'block'
    }
    function hideNextText(){
        (document.querySelector('.next-page-text') as HTMLDivElement).style.display = 'none'
    }
    function showEmptyData(){
        (document.querySelector('.empty-data') as HTMLDivElement).style.display = 'block'
    }
    function hideEmptyData(){
        (document.querySelector('.empty-data') as HTMLDivElement).style.display = 'none'
    }
}
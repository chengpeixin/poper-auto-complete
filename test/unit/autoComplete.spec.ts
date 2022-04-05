import { getDom, triggerInput } from '../util/dom';
import AutoComplete from './../../package/AutoComplete/index'
import $ from 'jquery'

const testData = []
for(let i=0;i<100000;i++){
    testData.push({
        label: `${i}hcdfj`,
        value: String(i)
    })
}

const createAutoComplete = () => {
    const target = getDom('div') as HTMLDivElement
    $(target).append(document.body)
    const autoComplete = new AutoComplete(target,{
        options:testData,
        width:'100%',
        height:50
    })
    return autoComplete
}

test('create AutoComplete', () => {
    const target = createAutoComplete().target
    const childrenLen = $(target).children().children().length
    expect(childrenLen).toBe(2);
});

test('create Poper',async ()=>{
    const target = getDom('div') as HTMLDivElement
    $(target).append(document.body)
    const autoComplete = new AutoComplete(target,{
        options:testData,
        width:'100%',
        height:50
    })
    const poper = autoComplete.poper.poperVnode.elm
    const shouldToBody = $(`.${$(poper).attr('class')}`).length >=0?true:false
    expect(shouldToBody).toBe(true);
})

test('input AutoComplete',() => {
    const target = createAutoComplete().target
    const $input = $(target).find('div span').parent().children('input')
    $input.val('123')
    expect($input.val()).toBe('123');
})

test('autoComplete should Poper',() => {
    const autoComplete= createAutoComplete()
    const $input = $(autoComplete.target).find('div span').parent().children('input')
    $input.val('123')
    $input.trigger('input')
    const $poper = $(autoComplete.poper.poperVnode.elm)
    expect($poper.css('display')).toBe('block');
})

test('autoComplete should Poper verification Result List',() => {
    const autoComplete= createAutoComplete()
    const $input = $(autoComplete.target).find('div span').parent().children('input')
    const searchVal = '123'
    const valReg = RegExp(/123/)
    $input.val(searchVal)
    triggerInput($input[0])
    const $poper = $(autoComplete.poper.poperVnode.elm)
    const $resDom = $poper.find('div[data-value]')
    const resText = [] 
    $resDom.each(function(){
        resText.push($(this).attr('data-label'))
    });
    let isResult = true
    resText.forEach(val=>{
        if (!val.match(valReg)){
            isResult = false
        }
    })
    expect(isResult).toBe(true);
})

test('autoComplete should Poper select item',() => {
    const autoComplete = createAutoComplete()
    const $input = $(autoComplete.target).find('div span').parent().children('input')
    $input.trigger('focus')
    const $poper = $(autoComplete.poper.poperVnode.elm)
    const selectDatas = []
    // 由于是虚拟列表，所以需要每次便利获取点击
    const clickItem = () => {
        // 300ms 模拟人手点击
        setTimeout(()=>{
            const $resItems =  $poper.find('div[data-value]')
            const $currentItem = $resItems.eq(1)
            selectDatas.push($currentItem.attr('data-value'))
            $currentItem.click()
        },300)
    }
    // 控制多选五个即可
    let i = 0
    while (i < 5) {
        jest.useFakeTimers();
        clickItem()
        i++;
        jest.runAllTimers(); 
    }
    const $tags = $(autoComplete.target).find('div > div:nth-child(1) > span').find('span[data-value]')
    const selectdDatas = []
    $tags.each(function(){
        selectdDatas.push($(this).attr('data-value'))
    })
    expect(selectDatas).toEqual(selectdDatas);
})
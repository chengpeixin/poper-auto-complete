import './less/index.less'
import { addEvent } from './util/event'
import datas from './data/data.json'
import Poper from './compoents/Poper'
const testData = []
for(let i=0;i<100000;i++){
    testData.push({
        label: i,
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

window.addEventListener('load',()=>{
    const autoComplete = document.querySelector('.auto-complete')
    const input:HTMLInputElement = document.querySelector('.auto-complete-input')
    // 初始默认不展示menu
    let menuVisibleOnFocus = false
    // 是否初始化过poper
    let isCreatedPoper = false
    let poper = null
    // 使其获取焦点
    addEvent(autoComplete,'click',()=>{
        if ( menuVisibleOnFocus ){
            menuVisibleOnFocus = false
        }
        input.focus()
    },{stop:true})
    poper = new Poper(input,testData)
    isCreatedPoper = true
    // 获取焦点
    addEvent(input,'focus',()=>{
        if ( !isCreatedPoper ){
            poper = new Poper(input)
            isCreatedPoper = true
        } else {
            poper.show()
        }
    })
    // 失去焦点
    addEvent(input,'blur',()=>{
        if ( isCreatedPoper ){
            poper.hide()
        }
    })

    console.log(input)
})
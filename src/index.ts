import './less/index.less'
import { addEvent } from './util/event'

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
    addEvent(autoComplete,'click',()=>{
        input.focus()
    },{stop:true})
    console.log(input)
})
import { init } from './../../src/index'
import $ from 'jquery'
const html = `<div id="xxx"></div>
<div class="scroll"></div>
<div class="next-page">
    <span class="next-page-text">下一页</span>
    <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
</div>`

const testData = []
for(let i=0;i<100000;i++){
    testData.push({
        label: `${i}hcdfj`,
        value: String(i)
    })
}

const pageSize = 10
test('create autoComplete HTML', () => {
    document.body.innerHTML = html
    const isExis= $('body').children('#xxx').length?true:false
    expect(isExis).toBe(true);
});

test('create newsList HTML', () => {
    document.body.innerHTML = html
    const isExis= $('body').children('.scroll').length?true:false
    expect(isExis).toBe(true);
});

test('create next-page HTML', () => {
    document.body.innerHTML = html
    const isExis= $('body').children('.next-page').length?true:false
    expect(isExis).toBe(true);
});

test('create init HTML Loading', () => {
    document.body.innerHTML = html
    const isLoading = $('body').find('.spinner').length?true:false
    expect(isLoading).toBe(true);
});

test('create init HTML should News', () => {
    document.body.innerHTML = html
    jest.useFakeTimers();
    init()
    jest.runAllTimers()
    const isShouldNewsItem = $('.result-item-fullbox').length>0?true:false
    expect(isShouldNewsItem).toBe(true);
});

test('click nextButton add the News', () => {
    document.body.innerHTML = html
    jest.useFakeTimers();
    init()
    $('.next-page').click()
    jest.runAllTimers()
    const isAllShouldNews = $('.result-item-fullbox').length===(pageSize*2)?true:false
    expect(isAllShouldNews).toBe(true);
});
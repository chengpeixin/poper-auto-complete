import AutoComplete from '/package/AutoComplete/index.ts'
console.log('XXXXXXXXXXXXXXXXX')

const testData = []
for(let i=0;i<100000;i++){
    testData.push({
        label: `${i}hcdfj`,
        value: String(i)
    })
}
describe("AutoComplete",()=>{
    it('create', () => {
        var dom = document.createElement("div")
        new AutoComplete(dom,{
            options:testData,
            width:'100%',
            height:50
        })
        // vm = createTest(Select, true);
        // expect(vm.$el.className).to.equal('el-select');
        // expect(vm.$el.querySelector('.el-input__inner').placeholder).to.equal('请选择');
        // vm.toggleMenu();
        expect(true).to.true;
      });

      it('测试测试测试测试测试', () => {
        // vm = createTest(Select, true);
        // expect(vm.$el.className).to.equal('el-select');
        // expect(vm.$el.querySelector('.el-input__inner').placeholder).to.equal('请选择');
        // vm.toggleMenu();
        expect(1).to.NaN;
      });
})
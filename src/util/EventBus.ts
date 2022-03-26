class EventBus {
  private eventList: {
    [eventName: string]: Function[];
  };
  constructor() {
      if ( !EventBus['instance']){
          console.log('new EventBus')
        this.eventList = {};
        this['instance'] = this
      }
      return EventBus['instance']
  }
  public on(eventName:string, fn:Function ){
    let eventList = this.eventList[eventName];
    if (typeof fn === 'function'){
        eventList ? eventList.push(fn) : (this.eventList[eventName] = [fn]);
    }
  }
  public emit(eventName:string, ...args) {
      this.eventList[eventName] && this.eventList[eventName].forEach((fn) => {
        fn(...args);
      });
  }
}

export default new EventBus()
import EventBus from "./EventBus";

export default class BaseClass {
    eventBus:EventBus
    constructor(){
        this.eventBus = new EventBus()
    }
}
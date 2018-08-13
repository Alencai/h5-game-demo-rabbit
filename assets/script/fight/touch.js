cc.Class({
    extends: cc.Component,

    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.evtKeyTouchStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.evtKeyTouchMove, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.evtKeyTouchEnd, this);
        // this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.evtKeyTouchEnd, this);
    },

    evtKeyTouchStart: function(evt) {
        tools.event.touchNow(mgrs.macro.evt_touch_bg, evt);
    },
    
    evtKeyTouchMove: function(evt) {
    },

    evtKeyTouchEnd: function(evt) {
    },
});

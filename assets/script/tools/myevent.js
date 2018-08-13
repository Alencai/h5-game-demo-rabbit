var _eventList = {};
var _delayList = {};
var _delayCount = 0;

export function registerEvt(id, obj, func) {
    if (id && cc.isValid(obj)) {
        var evtInfo = {obj: obj, func: func};
        var arrObj = _eventList[id];
        if (arrObj) {
            arrObj.push(evtInfo);
            return;
        }
        _eventList[id] = [evtInfo];
    }
}

export function removeEvt(id, obj) {
    if (id) {
        var arrObj = _eventList[id];
        for (var idx in arrObj) {
            if (arrObj[idx] == obj) {
                arrObj.splice(idx, 1);
                break;
            }
        }
    }
}

export function removeAll() {
    _eventList = {};
}

export function removeID(id) {
    if (id) {
        _eventList[id] = null;
    }
}

export function removeObj(obj) {
    for (var id in _eventList) {
        var arrEvtInfo = _eventList[id];
        for (var idx in arrEvtInfo) {
            if (arrEvtInfo[idx].obj == obj) {
                arrEvtInfo.splice(idx, 1);
                break;
            }
        }
    }
}

export function touchNow(id, data) {
    if (id) {
        var arrEvtInfo = _eventList[id];
        if (arrEvtInfo) {
            for (var idx = 0; idx < arrEvtInfo.length;) {
                var evtInfo = arrEvtInfo[idx];
                if (cc.isValid(evtInfo.obj)) {
                    if (evtInfo.func.call(evtInfo.obj, data)) {
                        arrEvtInfo.splice(idx, 1);
                    }
                    else {
                        ++idx;
                    }
                }
                else {
                    arrEvtInfo.splice(idx, 1);
                }
            }
        }
    }
}

export function touchDelay(id, data) {
    ++ _delayCount;
    _delayList[id] = data;
}

export function excuteDelay(){
    if (_delayCount > 0) {
        for (var id in _delayList) {
            touchNow(id, _delayList[id]);
        }
        _delayList = {};
        _delayCount = 0;
    }
}


function getSpeedXByRat(rat, speed) {
    return speed * Math.sin(rat);
}

function getSpeedYByRat(rat, speed) {
    return speed * Math.cos(rat);
}

function getPosXByRat(rat, posX, posY) {
    return posX * Math.cos(rat) + posY * Math.sin(rat);
}

function getPosYByRat(rat, posX, posY) {
    return posY * Math.cos(rat) - posX * Math.sin(rat);
}

function getRotationByPos(posX, posY) {
    if (posY < 0) {
        return Math.atan(posX / posY) * 180 / Math.PI + 180;
    }
    if (posY > 0) {
        return Math.atan(posX / posY) * 180 / Math.PI;
    }
    return posX < 0 ? -90 : 90;
}

function isCollision(x1, y1, x2, y2, r) {
    var disX = x1 - x2;
    var disY = y1 - y2;
    return disX * disX + disY * disY <= r * r;
}

cc.Class({
    extends: cc.Component,

    properties: {
        c_spBg: {default: null, type: cc.Node},
        c_spFight: {default: null, type: cc.Node},
        c_spDot1: {default: null, type: cc.Node},
        c_spDot2: {default: null, type: cc.Node},
        c_spRole: {default: null, type: cc.Node},
    },

    ctor: function () {
        this._speedDir = 5;
        this._accY = -0.1;
        this._posX = 0;
        this._posY = 0;
        this._speedX = 0;
        this._speedY = 0;
        this._standDot = null;
    },

    onLoad: function () {
        tools.event.registerEvt(mgrs.macro.evt_touch_bg, this, this.evtTouch);
        this.c_spDot1.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
        this.c_spDot2.runAction(cc.repeatForever(cc.rotateBy(4, 360)));
        this.doStand(this.c_spDot1);
    },

    doStand: function(dot) {
        if (dot) {
            var rotation = getRotationByPos(this._posX - dot.x, this._posY - dot.y) - dot.rotation;
            var rat = rotation * Math.PI / 180;
            var posX = 0;
            var posY = 30 + dot.height / 2;
            this._posX = getPosXByRat(rat, posX, posY);
            this._posY = getPosYByRat(rat, posX, posY);
            this.c_spRole.x = this._posX;
            this.c_spRole.y = this._posY;
            this.c_spRole.rotation = rotation;
            this.c_spRole.parent = dot;
            this._standDot = dot;
        }
    },

    doJump: function() {
        var dot = this._standDot;
        if (dot) {
            var role = this.c_spRole;
            var rotation = getRotationByPos(this._posX, this._posY) + dot.rotation;
            var ratRole = rotation * Math.PI / 180;
            var ratDot = dot.rotation * Math.PI / 180;
            var posX = getPosXByRat(ratDot, this._posX, this._posY);
            var posY = getPosYByRat(ratDot, this._posX, this._posY);
            this._speedX = getSpeedXByRat(ratRole, this._speedDir);
            this._speedY = getSpeedYByRat(ratRole, this._speedDir);
            this._posX = dot.x + posX;
            this._posY = dot.y + posY;
            role.x = this._posX;
            role.y = this._posY;
            role.rotation = rotation;
            role.parent = this.c_spFight;
            this._standDot = null;
            return;
        }
        this.doStand(this.c_spDot1);
    },

    doMove: function() {
        this._speedY += this._accY;
        this._posX += this._speedX;
        this._posY += this._speedY;
        this.c_spRole.x = this._posX
        this.c_spRole.y = this._posY;
        this.c_spRole.rotation = getRotationByPos(this._speedX, this._speedY);
    },
    
    update: function (dt) {
        if (this._standDot) {
            return;
        }
        this.doMove();
        if (isCollision(this._posX, this._posY, this.c_spDot1.x, this.c_spDot1.y, this.c_spDot1.width / 2)) {
            this.doStand(this.c_spDot1);
            return;
        }
        if (isCollision(this._posX, this._posY, this.c_spDot2.x, this.c_spDot2.y, this.c_spDot2.width / 2)) {
            this.doStand(this.c_spDot2);
            return;
        }
    },

    evtTouch: function(evt) {
        this.doJump();
    },
});

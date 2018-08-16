var default_speed = 5;
var default_accY = -0.1;
var default_role_height = 30;
var default_edge_disX = 100;
var default_edge_disY = 100;
var default_initX = 160;
var default_centerY = 160;
var default_r_min = 50;
var default_r_ext = 50;
var default_disX_min = 200;
var default_disX_ext = 200;
var default_disY_pre = -200;
var default_disY_ext = 200;
var default_rotate_min = 2;
var default_rotate_ext = 3;

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

function isDotCollision(x, y, dot) {
    var disX = x - dot.x;
    var disY = y - dot.y;
    return disX * disX + disY * disY <= dot.r * dot.r;
}

function newDotInfo() {
    return {
        x: default_initX, 
        y: default_centerY, 
        r: default_r_min + default_r_ext * Math.random(),
        t: default_rotate_min + default_rotate_ext * Math.random(),
        id: Math.ceil(4 * Math.random()),
        node: null
    };
}

cc.Class({
    extends: cc.Component,

    properties: {
        c_spBg: {default: null, type: cc.Node},
        c_spFight: {default: null, type: cc.Node},
        c_spDot1: {default: null, type: cc.Node},
        c_spDot2: {default: null, type: cc.Node},
        c_spDot3: {default: null, type: cc.Node},
        c_spDot4: {default: null, type: cc.Node},
        c_spRole: {default: null, type: cc.Node},
        c_spArrow: {default: null, type: cc.Node},
    },

    ctor: function () {
        this._posX = 0;
        this._posY = 0;
        this._speedX = 0;
        this._speedY = 0;
        this._fightX = 0;
        this._fightY = 0;
        this._fightscale = 1;
        this._standDot = null;
        this._idxDot = 0;
        this._arrDots = [];
    },

    onLoad: function () {
        tools.event.registerEvt(mgrs.macro.evt_touch_bg, this, this.evtTouch);
        this.c_spDot1.active = false;
        this.c_spDot2.active = false;
        this.c_spDot3.active = false;
        this.c_spDot4.active = false;
        this.initDot();
        this.doStand(0);
    },

    cleanDots: function() {
        var arrDots = this._arrDots;
        for (var i in arrDots) {
            var dot = arrDots[i];
            if (dot.node && cc.isValid(dot.node)) {
                dot.node.destroy();
            }
        }
        this._standDot = null;
        this._idxDot = 0;
        this._arrDots = [];
    },

    initDot: function() {
        this.cleanDots();
        this._arrDots.push(newDotInfo());
    },

    nextDot: function() {
        var count = this._arrDots.length;
        if (count <= 0) {
            return;
        }
        var need =  this._idxDot + 4;
        for (var i = count; i < need; ++i) {
            var newDot = newDotInfo();
            var preDot = this._arrDots[i - 1];
            newDot.x = preDot.x + default_disX_min + default_disX_ext * Math.random();
            newDot.y = preDot.y + default_disY_pre + default_disY_ext * Math.random();
            this._arrDots.push(newDot);
        }
        this.updateDotView();
    },

    createDotView(dot) {
        var node = null;
        switch(dot.id) {
            case 1: node = cc.instantiate(this.c_spDot1); break;
            case 2: node = cc.instantiate(this.c_spDot2); break;
            case 3: node = cc.instantiate(this.c_spDot3); break;
            case 4: node = cc.instantiate(this.c_spDot4); break;
        }
        if (node) {
            dot.node = node;
            node.x = dot.x;
            node.y = dot.y;
            node.active = true;
            node.scale = dot.r * 2 / node.width;
            node.parent = this.c_spFight;
            node.runAction(cc.repeatForever(cc.rotateBy(dot.t, 360)));
        }
    },

    updateDotView() {
        var len = 3;
        var idx = this._idxDot;
        var idxRemove = idx - len;
        for (var i = idxRemove > len ? idxRemove - len : 0; i < idxRemove; ++i) {
            var dot = this._arrDots[i];
            if (dot.node) {
                if (cc.isValid(dot.node)) {
                    dot.node.destroy();
                }
                dot.node = null;
            }
        }
        var idxShow = idx + len;
        for (var i = idx > len ? idx - len : 0; i < idxShow; ++i) {
            var dot = this._arrDots[i];
            if (!dot.node || !cc.isValid(dot.node)) {
                this.createDotView(dot);
            }
        }
    },

    stopCamera: function() {
        this.c_spFight.stopAllActions();
        this._fightX = this.c_spFight.x;
        this._fightY = this.c_spFight.y;
        this._fightscale = this.c_spFight.scale;
    },

    moveCamera: function() {
        // this.c_spFight.getNumberOfRunningActions()
        this._fightX -= this._fightscale * this._speedX / 2;
        this._fightY -= this._fightscale * this._speedY / 2;
        this.c_spFight.x = this._fightX;
        this.c_spFight.y = this._fightY;
    },

    updateCamera: function() {
        var idxDot = this._idxDot;
        if (idxDot < 0 || idxDot + 1 >= this._arrDots.length) {
            return;
        }
        var dot0 = this._arrDots[idxDot];
        if (!dot0 || !dot0.node || !cc.isValid(dot0.node)) {
            return;
        }
        var dot1 = this._arrDots[idxDot + 1];
        if (!dot1 || !dot1.node || !cc.isValid(dot1.node)) {
            return;
        }
        var screenWidth = this.node.width;
        var screenHeight = this.node.height;
        var cameraWidth = Math.abs(dot1.x - dot0.x) + dot1.r + dot0.r + default_edge_disX;
        var cameraHeight = Math.abs(dot1.y - dot0.y) + dot1.r + dot0.r + default_edge_disY;
        var scale = (screenWidth * cameraHeight < cameraWidth * screenHeight) ? (screenWidth / cameraWidth) : (screenHeight / cameraHeight);
        var endX = ((dot0.x - dot1.x) / 2 - dot0.x) * scale;
        var endY = ((dot0.y - dot1.y) / 2 - dot0.y) * scale;
        this.c_spFight.runAction(cc.spawn(cc.moveTo(0.5, endX, endY), cc.scaleTo(0.5, scale)));
    },

    doStand: function(idxDot) {
        if (idxDot < 0 || this._arrDots.length <= idxDot) {
            return;
        }
        this._idxDot = idxDot;
        this.nextDot();
        var dot = this._arrDots[idxDot];
        if (dot) { 
            var rotation = getRotationByPos(this._posX - dot.x, this._posY - dot.y) - dot.node.rotation;
            var rat = rotation * Math.PI / 180;
            var posY = default_role_height + dot.r;
            var scale = dot.node.scale;
            this._posX = getPosXByRat(rat, 0, posY);
            this._posY = getPosYByRat(rat, 0, posY);
            this.c_spRole.x = this._posX / scale;
            this.c_spRole.y = this._posY / scale;
            this.c_spRole.scale = 1 / scale;
            this.c_spRole.rotation = rotation;
            this.c_spRole.parent = dot.node;
            this._standDot = dot;
            this.c_spArrow.active = true;
        }
        this.updateCamera();
    },

    doJump: function() {
        this.stopCamera();
        var role = this.c_spRole;
        var dot = this._standDot;
        if (dot) {
            // 从星球上跳
            var rotation = getRotationByPos(this._posX, this._posY) + dot.node.rotation;
            var ratRole = rotation * Math.PI / 180;
            var ratDot = dot.node.rotation * Math.PI / 180;
            var posX = getPosXByRat(ratDot, this._posX, this._posY);
            var posY = getPosYByRat(ratDot, this._posX, this._posY);
            this._speedX = getSpeedXByRat(ratRole, default_speed);
            this._speedY = getSpeedYByRat(ratRole, default_speed);
            this._posX = dot.x + posX;
            this._posY = dot.y + posY;
            role.x = this._posX;
            role.y = this._posY;
            role.scale = 1;
            role.rotation = rotation;
            role.parent = this.c_spFight;
            this._standDot = null;
            this.c_spArrow.active = false;
            return;
        }
        // 二段跳
        var rotation = Math.ceil(role.rotation) % 360;
        var ratRole = ((rotation < -180 || 0 < rotation && rotation < 180) ? Math.PI : -Math.PI) / 4;
        this._speedX = getSpeedXByRat(ratRole, default_speed);
        this._speedY = getSpeedYByRat(ratRole, default_speed);
    },

    doMove: function() {
        this._speedY += default_accY;
        this._posX += this._speedX;
        this._posY += this._speedY;
        this.c_spRole.x = this._posX
        this.c_spRole.y = this._posY;
        this.c_spRole.rotation = getRotationByPos(this._speedX, this._speedY);
        this.moveCamera();
    },
    
    update: function (dt) {
        if (this._standDot) {
            return;
        }
        this.doMove();
        var posX = this._posX;
        var posY = this._posY;
        var arrDots = this._arrDots;
        var len = Math.min(this._idxDot + 4, arrDots.length);
        for (var idx = Math.max(this._idxDot - 4, 0); idx < len; ++idx) {
            var dot = arrDots[idx];
            if (isDotCollision(posX, posY, dot)) {
                this.doStand(idx);
                break;
            }
        }
    },

    evtTouch: function(evt) {
        this.doJump();
    },

    btnReset: function(evt) {
        this.initDot();
        this.doStand(0);
    },
});

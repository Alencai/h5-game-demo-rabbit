cc.Class({
    extends: cc.Component,

    properties: {
        c_spBgs: {default: [], type: [cc.Node]},
    },

    onLoad: function () {
    },

    update: function() {
        var spBgs = this.c_spBgs;
        var count = spBgs.length;
        if (count <= 0) {
            return;
        }
        var width = spBgs[0].width;
        var posX = -this.node.x;
        var idxStart = parseInt(posX / width);
        if (posX < 0) {
            idxStart = 1 - idxStart;
        }
        for (var i = 0; i < count; ++i) {
            var idxNow = (idxStart + i) % count;
            if (idxNow < 0) {
                idxNow += count;
            }
            spBgs[idxNow].x = (idxStart + i) * (width - 3);
            spBgs[idxNow].active = i + 1 < count;
        }
    }
});

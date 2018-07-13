// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var RTDataConvert = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null
    },
    properties: {
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad(){
        RTDataConvert.instance = this;
        this.GamesparksRT = this.getComponent("GameSparksRTManager");
    }
});

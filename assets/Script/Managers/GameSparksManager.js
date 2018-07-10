var GameSparksMgr = cc.Class({
    extends: cc.Component,
    statics:{
        instance: null
    },
    properties: {
        apiKey:"",
        apiSecrect:""
    },
    onLoad() {
        GameSparksMgr.instance = this;
        this.gamesparks = new GameSparks();
        this.initPreview();
    },
    initPreview(){
        cc.log("apiKey"+this.apiKey);
        cc.log("secret"+this.apiSecrect);
        this.gamesparks.initPreview({
            key: this.apiKey,
			secret: this.apiSecrect,
			credential: "device",
			onNonce: this.onNonce.bind(this),
			onInit: this.onInit.bind(this),
			onMessage: this.onMessage.bind(this),
			logger: cc.log,
        });
    },
    onInit(res){
        cc.log("onInit",res);
    },
    onNonce(nonce){
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce, this.apiSecrect));
    },
    onMessage(res) {
        cc.log("onMessage",res);
    }
});

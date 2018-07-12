var GameSparksMgr = cc.Class({
    extends: cc.Component,
    statics:{
        instance: null
    },
    properties: {
        apiKey:"",
        apiSecrect:"",
        onLoginSuccessListeners:[cc.Component.EventHandler],
        onLogoutListeners:[cc.Component.EventHandler]
    },
    onLoad() {
        GameSparksMgr.instance = this;
        this.gamesparks = new GameSparks();
        this.player = {
            _name: "TestPlayer_01",
            _id: "TP_0001",
            _photo: "none_url",
            getName(){return this._name;},
            getID() { return this._id},
            getPhoto() {return this._photo;}
        };
        this.initPreview();
    },
    //================================
    onEditBoxEnded(target) {
        cc.log(target);
        this.player._id = target.string;
    },
    emitLoginListeners(){
        for(let i in this.onLoginSuccessListeners) {
            this.onLoginSuccessListeners[i].emit();
        }
    },
    emitLogoutListeners(){
        for(let i in this.onLogoutListeners) {
            this.onLogoutListeners[i].emit();
        }
    },
    //================================
    initPreview(){
        this.gamesparks.initPreview({
            key: this.apiKey,
			secret: this.apiSecrect,
			credential: "device",
			onNonce: this.onNonce.bind(this),
			onInit: this.onInit.bind(this),
			onMessage: this.onMessage.bind(this),
			logger: console.log
        });
    },
    onInit(res){
        cc.log("onInit");
    },
    onNonce(nonce){
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce, this.apiSecrect));
    },
    onMessage(res) {
        cc.log("onMessage",res);
    },
    //==================================
    login() {
        let player = this.player;
        let request = {
            userName: player.getID(),
            password: player.getID()
        };
        this.gamesparks.sendWithData("AuthenticationRequest", request, this.onLoginResponse.bind(this));
    },
    onLoginResponse(res) {
        cc.log("onLoginResponse", res);
        if(res.error){
            this.registerRequest();
        } else {
            this.findRoom();
            this.emitLoginListeners();
        }
    },
    //==================================
    registerRequest() {
        let player = this.player;
        let request = {
            displayName: player.getID(),
            userName: player.getID(),
            password: player.getID()
        };
        this.gamesparks.sendWithData("RegistrationRequest", request, this.onRegisterResponse.bind(this));
    },
    onRegisterResponse(res) {
        cc.log("onRegisterResponse", res);
        if(!res.error) {
            this.findRoom();
        } else {
            cc.error(res.error);
            this.emitLogoutListeners();
        }
    },
    //==================================
    findRoom() {
        let request = {
            matchShortCode: "Farm",
            matchGroup: "ContextId",
            participantData: {
                playerID: this.player.getID(),
            },
            skill: 1
        };

        this.gamesparks.sendWithData("MatchmakingRequest", request, this.onMatchResponse.bind(this));
    },
    onMatchResponse(res) {
        cc.log("onMatchResponse", res);
    }
});

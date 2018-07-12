var GameSparksRTMgr = cc.Class({
    extends: cc.Component,
    statics:{
        instance: null
    },
    properties: {
        apiKey:"",
        apiSecret:"",
        onLoginSuccessListeners:[cc.Component.EventHandler]
    },
    onLoad() {
        GameSparksRTMgr.instance = this;
        this.initRTSession();
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
        this.ready = false;
    },
    //==============================================
    initPreview() {
        this.myRTSession.stop();

        this.gamesparks.initPreview({
            key: this.apiKey, 
			secret: this.apiSecret,
			credential: "",
			onNonce: this.onNonce.bind(this),
			onInit: this.onInit.bind(this),
			onMessage: this.onMessage.bind(this),
			logger: console.log,
        });
    },
    // ====================Event handlers=============
    onPlayerIDEditBoxEnd(target){
        this.player._id = target.string;
    },
    emitLoginListeners(){
        for(let i in this.onLoginSuccessListeners) {
            this.onLoginSuccessListeners[i].emit();
        }
    },
    onProduceActionPressed() {
        cc.log("onProduceActionPressed");
        let data = RTData.get();
        data.setString(1, "produce");
        data.setString(2, "Ing_Wheat_Crop");
        data.setString(3, "PB_Soil_Field");
        data.setLong(4, 1);
        this.myRTSession.session.sendRTData(101, GameSparksRT.deliveryIntent.RELIABLE, data, [0]);
    },
    onCollectActionPressed() {
        cc.log("onCollectActionPressed");
    },
    //===============================================
    login() {
        if(!this.ready) { cc.log("Gamesparks is not ready"); return; }

        let player = this.player;
        let request = {
            userName: player.getID(),
            password: player.getID()
        };
        this.gamesparks.sendWithData("AuthenticationRequest", request, this.onLoginResponse.bind(this));
    },
    onLoginResponse(res) {
        if(res.error) {
            cc.error(res.error);
            this.register();
        } else {
            cc.log("login success", res);
            this.sendMatchRequest();
        }
    },
    register() {
        let player = this.player;
        let request = {
            displayName: player.getID(),
            userName: player.getID(),
            password: player.getID()
        };
        this.gamesparks.sendWithData("RegistrationRequest", request, this.onRegisterResponse.bind(this));
    },
    onRegisterResponse(res) {
        if(res.error) {
            cc.error(res.error);
        } else {
            cc.log("register success", res);
            this.sendMatchRequest();
        }
    },
    //====================Gamesparks CB=======================================
    onNonce(nonce) {
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce, this.apiSecret));
    },
    onInit() {
        cc.log("onInit");
        this.ready = true;
    },
    onMessage(message) {
        cc.log("onMessage", message);
        if(message["@class"] === ".MatchFoundMessage") {
            let {accessToken, host, port} = message;

            this.myRTSession.stop();
            if(this.intervalLoop)
                clearTimeout(this.intervalLoop);
            this.intervalLoop = setInterval(this.mainRTLoop.bind(this), 10);
            this.myRTSession.start(accessToken, host, port);
            this.emitLoginListeners();
        }
    },
    //==============================Match functions===========================
    sendMatchRequest() {
        let request = {
            matchShortCode: "Farm",
            matchGroup: "ContextId",
            participantData: {
                playerID: this.player.getID(),
            },
            skill: 0
        };

        this.gamesparks.sendWithData("MatchmakingRequest", request, this.onMatchResponse.bind(this));
    },
    onMatchResponse(res) {
        cc.log("onMatchResponse", res);
    },
    //==============================Test======================================
    mainRTLoop(){
        if(this.myRTSession.started) {
            this.myRTSession.session.update();
            // let data = RTData.get();
            // let numCycles = this.numCycles || 0;
            // data.setLong(1, numCycles);
            // this.myRTSession.session.sendRTData(1, GameSparksRT.deliveryIntent.RELIABLE, data, []);
            // this.numCycles = numCycles + 1;
        }
    },
    //====================Real time Session Functions==========================
    initRTSession(){
        this.myRTSession = {
            started:false,
            onPlayerConnect: this.onPlayerConnected.bind(this),
            onPlayerDisconnect: this.onPlayerDisconnected.bind(this),
            onReady: this.onSessionReady.bind(this),
            onPacket: this.onPacketReceived.bind(this),
            session: null,
            start: this.startRTSession.bind(this),
            stop: this.stopRTSession.bind(this),
            log: this.log.bind(this)
        }
    },
    onPlayerConnected(res){
        cc.log("onPlayerConnectedCB", res);
    },
    onPlayerDisconnected(res){
        cc.log("onPlayerDisconnected", res);
    },
    onSessionReady(res) {
        cc.log("onSessionReady", res);
        const INIT_CODE = 100;
        this.myRTSession.session.sendRTData(INIT_CODE, GameSparksRT.deliveryIntent.RELIABLE, RTData.get().setString(1, this.player.getID()), [0]);
    },
    onPacketReceived(res) {
        cc.log("onPacketReceived", res);
        // if(res.opCode == 101) 
        {
            let data = res.data;
            cc.log(data.getString(1));
            cc.log(data.getString(2));
            cc.log(data.getString(3));
            cc.log("Slot " +data.getLong(4));
        }
    },
    startRTSession(connectToken, host, port) {
        var index = host.indexOf(":");
		var theHost;

		if (index > 0) {
			theHost = host.slice(0, index);
		} else {
			theHost = host;
		}

		console.log(theHost + " : " + port);

		this.myRTSession.session = GameSparksRT.getSession(connectToken, theHost, port, this.myRTSession);
		if (this.myRTSession.session != null) {
			this.myRTSession.started = true;

			this.myRTSession.session.start();
		} else {
			this.myRTSession.started = false;
		}
    },
    stopRTSession() {
        this.myRTSession.started = false;

        if(this.myRTSession.session != null) {
            this.myRTSession.session.stop();
        }
    },
    log(message) {
        let peers = "|";

        for (var index in myRTSession.session.activePeers) { 
			peers = peers + myRTSession.session.activePeers[index] + "|";
		}

		console.log(myRTSession.session.peerId + ": " + message + " peers:" + peers);
    }
});

// preloader
var preloaderEl = document.querySelector('.preloaderSeciton');
var mainSection = document.querySelector('.mainSection-showing');

window.addEventListener('load', function () {
    preloaderEl.classList.add('preloader-hiding');
    mainSection.classList.remove('mainSection-showing');
    preloaderEl.addEventListener('transitionend', function () {
        preloaderEl.classList.add('preloader-hidden');
        preloaderEl.classList.remove('preloader-hiding');
        console.log("preloader done");
    })
});

var socket = io();

new Vue({
    el: '#app',
    data: {
        connectedUsers: [],
        messages: [],
        message: {
            "type": "",
            "action": "",
            "user": "",
            "text": "",
            "timestamp": "",
            "isGif": false
        },
        areTyping: [],
        isShow: false,
        lennys: [
            { face: '( ͡° ͜ʖ ͡°)' },
            { face: '¯\_(ツ)_/¯' },
            { face: '(ง ͠° ͟ل͜ ͡°)ง' },
            { face: 'ಠ_ಠ' },
            { face: '(☞ﾟ∀ﾟ)☞' },
            { face: '\ (•◡•) /' }
        ],
        isShowGif: false,
        status: '',
        query: '',
        keyApi: "S5DI6R8Mq2NZsLgkLAUgk5gULADJ0j2f",
        limit: '3',
        gifs: []
    },
    created: function () {
        socket.on('user joined', function (socketId) {

            axios.get('/onlineusers').then(function (response) {
                for (var key in response.data) {
                    if (this.connectedUsers.indexOf(key) <= -1) {
                        this.connectedUsers.push(key);
                    }
                }
            }.bind(this));
            var infoMsg = {
                "type": "info",
                "msg": "User " + socketId + "has joined."
            }
            this.messages.push(infoMsg);
        }.bind(this));

        //add messages load here like up for onlineusers
        /*
        
        here!!
        
        */

        //if server emits 'chat.message', update messages array
        socket.on('chat.message', function (message) {
            if( message.text == ''){
                return;
            }
            if( message.text.includes("/media")){
                message.text = '<img src="' + message.text + '">';
                message.isGif = true;
            }
            this.messages.push(message);
            var i = this.messages.lastIndexOf(message);
            if(this.messages[i].text == '!hello')
                this.$refs.myDiv.play();
            this.autoScroll();
        }.bind(this));

        //server emits 'user typing'
        socket.on('user typing', function (username) {
            this.areTyping.push(username);
        }.bind(this));

        //server emits 'stopped typing'
        socket.on('stopped typing', function (username) {
            var index = this.areTyping.indexOf(username);
            if (index >= 0) {
                this.areTyping.splice(index, 1);
            }
        }.bind(this));

        //if server broadcasts 'user left', remove leaving user from connectedUsers array
        socket.on('user left', function (socketId) {
            var index = this.connectedUsers.indexOf(socketId);
            if (index >= -1) {
                //slice deletes from list
                this.connectedUsers.splice(index, 1);
            }
            var infoMsg = {
                "type": "info",
                "msg": "User " + socketId + "has left."
            }
            this.messages.push(infoMsg);
        }.bind(this));
    },
    computed: {
        helloDarkness: function () {
            //function to music Hę?!
        }
    },
    methods: {
        send: function () {
            this.message.type = "chat";
            this.message.user = socket.id;
            this.message.timestamp = moment().calendar();
            socket.emit('chat.message', this.message);
            this.message.type = '';
            this.message.user = '';
            this.message.text = '';
            this.message.timestamp = '';
        },
        userIsTyping: function (username) {
            if (this.areTyping.indexOf(username) >= 0) {
                return true;
            }
            return false;
        },
        usersAreTyping: function () {
            if (this.areTyping.indexOf(socket.id) <= -1) {
                this.areTyping.push(socket.id);
                socket.emit('user typing', socket.id);
            }
        },
        stoppedTyping: function (keycode) {
            if (keycode == '13' || (keycode == '8' && this.message.text == '')) {
                var index = this.areTyping.indexOf(socket.id);
                if (index >= 0) {
                    this.areTyping.splice(index, 1);
                    socket.emit('stopped typing', socket.id);
                }
            }

        },
        lennyToInput: function (lenny) {
            this.message.text += lenny.face;

        },
        loadGif: function () {
            this.gifs = [];
            this.status = 'Loading...';
            var vm = this;
            axios.get('//api.giphy.com/v1/gifs/search?q=' + this.query + "&api_key=" + this.keyApi + "&limit=" + this.limit).then(function (response) {
                for(var i = 0; i < vm.limit ; i++){
                    vm.status = response.data.data[i].images.preview_gif.url.slice(6);
                    vm.gifs.push(vm.status);
                }
            }).catch(function (error) {
                vm.status = 'Error ' + error;
            })
        },
        autoScroll: function(){
            var elem = document.getElementById('main-body');
            elem.scrollTop = elem.scrollHeight;
            console.log(elem.scrollTop + "  "+ elem.scrollHeight);
        },
        sendGif: function (gif){
            console.log(gif);
            this.message.text = gif;
            this.send();
        }
    }
});



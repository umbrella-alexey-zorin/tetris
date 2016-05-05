function Validator(options) {
	this.ajax = false || options.ajax;
    this.form = options.form;
    this.msgElem = options.msgElem;
    this.shadowElem = options.shadowElem;
    this.url = options.url;
    if(this.form) this.form.addEventListener('submit', this.validate.bind(this));
    console.log(this.ajax);
}

Validator.prototype.validate = function(e) {
    var event = e || window.event;
    event.preventDefault ? event.preventDefault() : (event.returnValue=false);
    if(this.form.elements.username) {
        if(!this.checkLogin()) return;
    }
    if(this.form.elements.email) {
        if(!this.checkEmail()) return;
    }
    if(this.form.elements.password) {
        if(!this.checkPassword()) return;
    }
    if(this.form.elements.confirm) {
        if(!this.checkConfirm()) return;
    }
    this.ajax ? this.sendAjaxRequest(this.form, this.url) : this.form.submit();
};

Validator.prototype.checkLogin = function() {
    var val = this.form.elements.username.value.trim();
    if(val.length < 3 || val.length > 15) {
        this.showMsg('Логин должен содержать более 2х символов, но не более 15', 'error');
        return false;
    }
    if(!(/^[a-zA-Z][a-zA-Z0-9-_\.]+$/.test(val))) {
        this.showMsg('Логин может содержать только символы латинского алфавита, цифры, знак подчеркивания и точку. Только буква может быть первым символом.', 'error')
        return false;
    }
    return true;
};

Validator.prototype.checkEmail = function() {
    var val = this.form.elements.email.value.trim();
    if(!(/^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/.test(val))) {
        this.showMsg('Неверный формат Email', 'error');
        return false;
    }
    return true;
};

Validator.prototype.checkPassword = function() {
    var val = this.form.elements.password.value.trim();
    if(val.length < 4 || val.length > 15) {
        this.showMsg('Пароль должен содержать более 3х символов, но не более 15', 'error');
        return false;
    }
    if(!(/^[a-zA-Z0-9]+$/.test(val))) {
        this.showMsg('Пароль может содержать только символы латинского алфавита и цифры.', 'error');
        return false;
    }
    return true;
};

Validator.prototype.checkConfirm = function() {
    var val = this.form.elements.password.value.trim();
    var valCheck = this.form.elements.confirm.value.trim();
    if(val !== valCheck) {
        this.showMsg('Пароли не совпадают', 'error');
        return false;
    }
    return true;
};

Validator.prototype.showMsg = function(msg, type) {
    var self = this;
    this.msgElem.firstElementChild.innerHTML = msg;
    this.msgElem.firstElementChild.className = type;
    this.msgElem.style.display = 'block';
    setTimeout(function(){
        self.msgElem.firstElementChild.classList.add('show');
    }, 20);
    setTimeout(function(){
        self.msgElem.firstElementChild.classList.remove('show');
        setTimeout(function(){
            self.msgElem.style.display = 'none';
        }, 500)
    }, 3000);
    if(type == 'access') {
        setTimeout(function() {
            window.location = '/';
        },1500);
    }
};

Validator.prototype.sendAjaxRequest = function(myform, url) {
    var xhr = this.getXhrObject(),
        self = this;
    if(xhr){
        var elems = myform.elements,
            url = url,
            params = [],
            elName,
            elType;
        for(var i = 0; i < elems.length; i++){
            elType = elems[i].type;
            elName = elems[i].name;
            if(elName){
                if((elType == 'checkbox' || elType == 'radio') && !elems[i].checked) continue;
                params.push(elems[i].name + '=' + elems[i].value);
            }
        }
        params.push('typeBox=' + myform.getAttribute('data-type'));
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                self.shadowElem.style.display = 'none';
                var str = JSON.parse(xhr.responseText);
                self.showMsg(str[0], str[1]);
            }
        };
        self.shadowElem.style.display = 'block';
        xhr.send(params.join('&'));
    }
};

Validator.prototype.getXhrObject = function() {
    if(typeof XMLHttpRequest === 'undefined'){
        XMLHttpRequest = function() {
            try {
                return new window.ActiveXObject( "Microsoft.XMLHTTP" );
            } catch(e) {}
        };
    }
    return new XMLHttpRequest();
};

new Validator({
    form: document.querySelector('.login form'),
    msgElem: document.querySelector('.require'),
    shadowElem: document.querySelector('.shadow_query'),
    url: '/login/signin/',
    ajax: true
});

new Validator({
    form: document.querySelector('.registration form'),
    msgElem: document.querySelector('.require'),
    shadowElem: document.querySelector('.shadow_query'),
    url: '/login/registration/',
    ajax: true
});

new Validator({
    form: document.querySelector('.email form'),
    msgElem: document.querySelector('.require'),
    shadowElem: document.querySelector('.shadow_query'),
    url: '/login/resendEmail/',
    ajax: true
});

new Validator({
    form: document.querySelector('.password form'),
    msgElem: document.querySelector('.require'),
    shadowElem: document.querySelector('.shadow_query'),
    url: '/login/sendPasswordRecovery/',
    ajax: true
});

new Validator({
    form: document.querySelector('.forgot form'),
    msgElem: document.querySelector('.require'),
    shadowElem: document.querySelector('.shadow_query'),
    url: '/login/NewPassword/',
    ajax: true
});




/*
var formAunt = document.querySelector('.login form');
var formReg = document.querySelector('.registration form');
formAunt.addEventListener('submit', send_r);
formReg.addEventListener('submit', send_reg);

function send_reg(e) {
	var event = e || window.event;
    event.preventDefault ? event.preventDefault() : (event.returnValue=false);
    sendAjaxRequest(this, '/scripts/registration.php');
    document.querySelector('.shaddow_query').style.display = 'block';
}


function send_r(e) {
	var event = e || window.event;
    event.preventDefault ? event.preventDefault() : (event.returnValue=false);
    sendAjaxRequest(this, '/scripts/signin.php');
    document.querySelector('.shaddow_query').style.display = 'block';
}

function getXhrObject(){
        if(typeof XMLHttpRequest === 'undefined'){
            XMLHttpRequest = function() {
                try {
                    return new window.ActiveXObject( "Microsoft.XMLHTTP" );
                } catch(e) {}
            };
        }
        return new XMLHttpRequest();
    }

    function showRequire(str) {
        var reqElem = document.querySelector('.require');
        var str = JSON.parse(str);
        reqElem.firstElementChild.innerHTML = str[0];
        reqElem.firstElementChild.className = str[1];
        if(str[1] == 'access') {
        	setTimeout(function() {
        		window.location = '/';
        	},1000)
        }
        

        reqElem.style.display = 'block';
        setTimeout(function(){
            reqElem.firstElementChild.classList.add('show');
        }, 20);
        setTimeout(function(){
            reqElem.firstElementChild.classList.remove('show');
            setTimeout(function(){
                reqElem.style.display = 'none';
            }, 500)
        }, 3000)

    }

    function sendAjaxRequest(myform, url){
        var xhr = getXhrObject();
        if(xhr){
            var elems = myform.elements, // все элементы формы
                url = url, // путь к обработчику
                params = [],
                elName,
                elType;
            // проходимся в цикле по всем элементам формы
            for(var i = 0; i < elems.length; i++){
                elType = elems[i].type; // тип текущего элемента (атрибут type)
                elName = elems[i].name; // имя текущего элемента (атрибут name)
                if(elName){ // если атрибут name присутствует
                    // если это переключатель или чекбокс, но он не отмечен, то пропускаем
                    if((elType == 'checkbox' || elType == 'radio') && !elems[i].checked) continue;
                    // в остальных случаях - добавляем параметр "ключ(name)=значение(value)"
                    params.push(elems[i].name + '=' + elems[i].value);
                }
            }
            params.push('typeBox=' + myform.getAttribute('data-type'));

            // Для GET-запроса
            //url += '?' + params.join('&');

            xhr.open('POST', url, true); // открываем соединение
            // заголовки - для POST-запроса
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4 && xhr.status == 200) { // проверяем стадию обработки и статус ответа сервера
                	document.querySelector('.shaddow_query').style.display = '';
                    showRequire(xhr.responseText);
                }
            };
            // стартуем ajax-запрос
            xhr.send(params.join('&')); // для GET запроса - xhr.send(null);
        }
    }


*/
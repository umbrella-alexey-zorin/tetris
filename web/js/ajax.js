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
            window.location = '/login';
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
    ajax: false
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
    url: '/login/initRecoveryPassword',
    ajax: true
});

new Validator({
    form: document.querySelector('.forgot form'),
    msgElem: document.querySelector('.require'),
    shadowElem: document.querySelector('.shadow_query'),
    url: '/login/NewPassword/',
    ajax: true
});





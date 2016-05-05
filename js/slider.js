function Slide(options) {
    this.select = options.select;
    this.target = document.querySelectorAll(options.target);
    for(var i = 0; i < this.target.length; i++) {
        this.target[i].addEventListener('click', this.changer.bind(this));
    }
}

Slide.prototype.changer = function(e) {
    e.preventDefault();
    var selector = e.target.getAttribute('data-selector');
    var formOut = e.target.closest(this.select);
    var formIn = document.querySelector(selector);
    formOut.classList.add('hide');
    formOut.style.display = 'none';
    formIn.style.display = 'block';
    setTimeout(function() {
        formIn.classList.remove('hide');
    }, 30);
};

var b = new Slide({
    select: '.loginWrap',
    target: '.loginWrap a'
});


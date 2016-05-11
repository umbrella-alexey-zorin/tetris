function tableBuilder (x, y, selector) {
    var table = '<table><tbody>',
        i, j;
    for(i = 0; i < y; i++ ) {
        table += '<tr>';
        for(j = 0; j < x; j++ ) {
            table += '<td></td>';
        }
        table += '</tr>';
    }
    table += '</tbody></table>';
    document.querySelector(selector).innerHTML = table;
}

tableBuilder(12,20, '.tableWrap');
tableBuilder(12,4, '.preview div');

function arrBuilder() {
    var arr = [],
        i, j;
    for(i = 0; i < 20; i++) {
        arr.push([]);
        for(j = 0; j < 12; j++) {
            arr[i][j] = false;
        }
    }
    return arr;
}

var arr;

var FigureModel = Backbone.Model.extend({
    initialize: function() {
        var rand = Math.round(- 0.5 + Math.random()*7);
        var temp;
        switch (rand) {
            case 0: temp = {y1: 0, x1: 4, y2: 0, x2: 4+1, y3: 0, x3: 4+2, y4: 1, x4: 4+2, f: 'L', s: 1, c: this.color()};
                break;
            case 1: temp = {y1: 0, x1: 4, y2: 0, x2: 4+1, y3: 0, x3: 4+2, y4: 1, x4: 4, f: 'iL', s: 1, c: this.color()};
                break;
            case 2: temp = {y1: 0, x1: 4, y2: 0, x2: 4+1, y3: 0, x3: 4+2, y4: 1, x4: 4+1, f: 'T', s: 1, c: this.color()};
                break;
            case 3: temp = {y1: 0, x1: 4, y2: 0, x2: 4+1, y3: 0, x3: 4+2, y4: 0, x4: 4+3, f: 'I', s: 1, c: this.color()};
                break;
            case 4: temp = {y1: 0, x1: 4+1, y2: 0, x2: 4+2, y3: 1, x3: 4, y4: 1, x4: 4+1, f: 'S', s: 1, c: this.color()};
                break;
            case 5: temp = {y1: 0, x1: 4, y2: 0, x2: 4+1, y3: 1, x3: 4+1, y4: 1, x4: 4+2, f: 'iS', s: 1, c: this.color()};
                break;
            case 6: temp = {y1: 0, x1: 4+1, y2: 0, x2: 4+2, y3: 1, x3: 4+1, y4: 1, x4: 4+2, f: 'O', s: 1, c: this.color()};
                break;
        }
        this.setItem(temp);
    },
    setItem: function(obj) {
        for(var key in obj) {
            if(!obj.hasOwnProperty(key)) continue;
            this.set(key, obj[key]);
        }
    },
    color: function() {
        var rand = Math.round(- 0.5 + Math.random()*4);
        var temp;
        switch (rand) {
            case 0: temp = 'red';
                break;
            case 1: temp = 'yellow';
                break;
            case 2: temp = 'blue';
                break;
            case 3: temp = 'green';
                break;
        }
        return temp;
    },
    validate: function(attrs) {
        if(attrs.y1 < 0 || attrs.y2 < 0 || attrs.y3 < 0 || attrs.y4 < 0 || attrs.x1 < 0 || attrs.x2 < 0 ||
            attrs.x3 < 0 || attrs.x4 < 0 || attrs.y1 > 19 || attrs.y2 > 19 || attrs.y3 > 19 || attrs.y4 > 19 ||
            attrs.x1 > 12 || attrs.x2 > 12 || attrs.x3 > 12 || attrs.x4 > 12) {
            return 'error';
        }
    }
});


/*------------------------------------------------------INFO ---------------------------------------------- */
var InfoModel = Backbone.Model.extend({
    default: {name: 'Player', points: 0, lvl: 1, count: 0, speed: 700}
});
var infoModel = new InfoModel({});

var InfoView = Backbone.View.extend({
    el: '.rightColumn',
    initialize: function() {
        this.model.on('change', function() {
            if(this.model.hasChanged('name')) this.render('.playerName', 'name');
            if(this.model.hasChanged('points')) this.render('.points', 'points');
            if(this.model.hasChanged('lvl')) this.render('.level p:last-child', 'lvl');
            if(this.model.hasChanged('count')) this.check();
        }, this);
    },
    render: function(selector, attr) {
        this.el.querySelector(selector).innerHTML = this.model.get(attr);
    },
    check: function() {
        var model = this.model.toJSON();
        if(model.count/model.lvl >= 30) {
            this.model.set({lvl: model.lvl + 1, speed: model.speed - 50});
        }
    },
});

var infoView = new InfoView({
    model: infoModel
});


/* --------------------------------------GLOBAL -------------------------------------------------------*/

var GlobalModel = Backbone.Model.extend({});
var globalModel = new GlobalModel({
    gameON: false, 
    pause: false
});


var GlobalView = Backbone.View.extend({
    el: document.querySelector('.tableWrap tbody'),
    initialize: function() {
        this.newEventKey = _.bind(this.eventKey, this);
        this.on('change:nextFigure', this.renderNextFigure, this);
        this.model.on('change', function() {
            if(this.model.hasChanged('gameON')) this.startEndGame();
            if(this.model.hasChanged('pause')) this.pause();
        }, this);
    },
    startEndGame: function() {
        var state = this.model.get('gameON');
        if(state) {
            document.addEventListener('keydown', this.newEventKey);
            this.clearField();
            this.getFigure();
        } 
    },
    pause: function() {
        if(this.model.get('pause')) {
            document.removeEventListener('keydown', this.newEventKey);
            clearTimeout(this.timerID);
        } else {
            document.addEventListener('keydown', this.newEventKey);
            this.move();
        }
    },
    renderNextFigure: function() {
        var elem = document.querySelector('.preview tbody'),
            figure = this.nextFigure.toJSON(),
            i, j;
        for(i = 0; i < 4; i++) {
            for(j = 4; j < 8; j++) {
                elem.rows[i].cells[j].className = '';
            }
        }
        for(i = 4; i > 0; i--) {
            elem.rows[figure['y'+i]].cells[figure['x'+i]].className = 'action ' + figure.c;
        }
    },
    lineHunter: function() {
        var count = 0,
            points = 0,
            state = false,
            i, j, k;

        for(i = 20 - 1; i >= 0; i--) {
            for(j = 0; j < 12; j++) {
                if(!arr[i][j].frozen) {
                    state = false;
                    break;
                }
                state = true;
            }
            if(state) {
                for(k = 0; k < 12; k++) {
                    arr[i][k] = false;
                }
                i++;    
                shift.call(this, i);
                count++;
                points += count*100; 
            }
        }
        if(count) {
            this.updateField(arr);
            this.updateScore(points);
        } 
        function shift(v) {
            for(var i = v-1; i >= 0; i--) {
                for(j = 0; j < 12; j++) {
                    if(arr[i][j].frozen) {
                        arr[i+1][j] = arr[i][j];
                        arr[i][j] = false;
                    }
                }
            }
        }
    },
    updateScore: function(points) {
        infoModel.set('points', infoModel.get('points') + points);
    },
    clearField: function() {
        for(var i = 0; i < 20; i++) {
            for(var j = 0; j < 12; j++) {
                this.el.rows[i].cells[j].className = '';
            }
        }
    },
    updateField: function(arr) {
        var temp, i, j;
        for(i = 0; i < arr.length; i++) {
            for(j = 0; j < arr[i].length; j++) {
                temp = arr[i][j];
                this.el.rows[i].cells[j].className = (temp) ? temp.c : '';
            }
        }
    },
    getFigure: function() {
        if(!this.nextFigure) {
            this.nextFigure = new FigureModel();
            this.figure = new FigureModel();
        } else {
            this.figure = this.nextFigure;
            this.nextFigure = new FigureModel();
        }
        this.trigger('change:nextFigure');
        this.listenTo(this.figure, 'change', this.AllChange);
        this.setChanges(this.figure, true);
        this.render(this.figure, true);
        if(this.checkEdge(this.figure, 'd')) {
            this.stopListening(this.figure, 'change', this.AllChange);
            this.gameOver();
            return;
        }
        this.move();
    },
    gameOver: function() {
        document.removeEventListener('keydown', this.newEventKey);
        this.model.set('gameON', false);
        endModel.set('show', true);
    },
    render: function(model, attr) {
        var obj = (attr) ? model.toJSON() : model,
            i;
        for(i = 4; i > 0; i--) {
            this.el.rows[obj['y'+i]].cells[obj['x'+i]].className = (attr) ? obj.c : '';
        }
    },
    setChanges: function(model, attr) {
        var obj = (attr) ? model.toJSON() : model,
            i;
        for(i = 4; i > 0; i--) {
            arr[obj['y'+i]][obj['x'+i]] = (attr) ? {f: obj.f, s: obj.s, c: obj.c} : false;
        }
    },
    move: function() {
        var self = this;
        function moven() {
            var figure = self.figure.toJSON();
            if(self.checkEdge(self.figure, 'd')) {
                self.toFrozen(self.figure);
                self.stopListening(self.figure, 'change', self.AllChange);
                self.lineHunter();
                infoModel.set('count', infoModel.get('count') + 1);
                self.getFigure();
                return;
            }
            self.figure.set({y4: figure['y4'] + 1, y3: figure['y3'] + 1, y2: figure['y2'] + 1, y1: figure['y1'] + 1}, {validate:true});
            self.timerID = setTimeout(moven, infoModel.get('speed'));
        }
        self.timerID = setTimeout(moven, infoModel.get('speed'));
    },
    AllChange: function() {
        this.setChanges(this.figure.previousAttributes(), false);
        this.setChanges(this.figure, true);
        this.render(this.figure.previousAttributes(), false);
        this.render(this.figure, true);
    },
    checkEdge: function(val, p) {
        var temp = (p !== 't') ? val.toJSON() : val,
            i;
        if(p === 'm') {
            for(i = 4; i > 0; i--) {
                temp['x'+i] -= 1;
            }
        }

        if(p === 'p') {
            for(i = 4; i > 0; i--) {
                temp['x'+i] += 1;
            }
        }

        if(p === 'd') {
            for(i = 4; i > 0; i--) {
                temp['y'+i] += 1;
            }
        }
        for(i = 4; i > 0; i--) {
            if(temp['x'+i] < 0 || temp['x'+i] > 12 - 1 || temp['y'+i] < 0 || temp['y'+i] > 19 ) return true;
            if(p === 't' && arr[temp['y'+i]][temp['x'+i]].frozen) return true;
            if((p === 'd' || p === 'n') && (arr[Math.min(temp['y'+i], 20-1)][temp['x'+i]].frozen || arr[Math.min(temp['y'+i] - 1, 20-1)][temp['x'+i]].frozen)) return true;
            if((p === 'm' || p === 'p') && arr[temp['y'+i]][Math.max(temp['x'+i], 0)].frozen) return true;
        }
        return false;
    },
    toFrozen: function(model) {
        var obj = model.toJSON(),
            i
        for(i = 4; i > 0; i--) {
            arr[obj['y'+i]][obj['x'+i]].frozen = true;
        }
    },
    eventKey: function(e) {
        if(e.keyCode === 38) {
            var p = this.figure.toJSON(),
                temp;
            if(p.f === 'L') {
                switch(p.s) {
                    case 1:
                        temp = {y1: p.y1 - 1, x1: p.x1 + 1, y2: p.y2, x2: p.x2, y3: p.y3 + 1, x3: p.x3 - 2, y4: p.y4, x4: p.x4 - 1, s: 2};
                        break;
                    case 2:
                        temp = {y1: p.y1, x1: p.x1 - 1, y2: p.y2, x2: p.x2 - 1, y3: p.y3 - 1, x3: p.x3+1, y4: p.y4 - 1, x4: p.x4 + 1, s: 3};
                        break;
                    case 3:
                        temp = {y1: p.y1, x1: p.x1 + 1, y2: p.y2 - 1, x2: p.x2 + 2, y3: p.y3, x3: p.x3, y4: p.y4 + 1, x4: p.x4 - 1, s: 4};
                        break;
                    case 4:
                        temp = {y1: p.y1 + 1, x1: p.x1 - 1, y2: p.y2 + 1, x2: p.x2 - 1, y3: p.y3, x3: p.x3 + 1, y4: p.y4, x4: p.x4 + 1, s: 1};
                        break;
                }
            }
            if(p.f === 'iL') {
                switch(p.s) {
                    case 1:
                        temp = {y1: p.y1 - 1, x1: p.x1, y2: p.y2 - 1, x2: p.x2, y3: p.y3, x3: p.x3 - 1, y4: p.y4, x4: p.x4 + 1, s: 2};
                        break;
                    case 2:
                        temp = {y1: p.y1, x1: p.x1 + 2, y2: p.y2 + 1, x2: p.x2 - 1, y3: p.y3, x3: p.x3, y4: p.y4 - 1, x4: p.x4 + 1, s: 3};
                        break;
                    case 3:
                        temp = {y1: p.y1, x1: p.x1 - 1, y2: p.y2, x2: p.x2 + 1, y3: p.y3 + 1, x3: p.x3, y4: p.y4 + 1, x4: p.x4, s: 4};
                        break;
                    case 4:
                        temp = {y1: p.y1 + 1, x1: p.x1 - 1, y2: p.y2, x2: p.x2, y3: p.y3 - 1, x3: p.x3 + 1, y4: p.y4, x4: p.x4 - 2, s: 1};
                        break;
                }
            }
            if(p.f === 'T') {
                switch(p.s) {
                    case 1:
                        temp = {y1: p.y1 - 1, x1: p.x1 + 1, y2: p.y2, x2: p.x2 - 1, y3: p.y3, x3: p.x3 - 1, y4: p.y4, x4: p.x4, s: 2};
                        break;
                    case 2:
                        temp = {y1: p.y1, x1: p.x1, y2: p.y2, x2: p.x2, y3: p.y3, x3: p.x3, y4: p.y4 - 1, x4: p.x4 + 1, s: 3};
                        break;
                    case 3:
                        temp = {y1: p.y1, x1: p.x1, y2: p.y2, x2: p.x2 + 1, y3: p.y3, x3: p.x3 + 1, y4: p.y4 + 1, x4: p.x4 - 1, s: 4};
                        break;
                    case 4:
                        temp = {y1: p.y1 + 1, x1: p.x1 - 1, y2: p.y2, x2: p.x2, y3: p.y3, x3: p.x3, y4: p.y4, x4: p.x4, s: 1};
                        break;
                }
            }
            if(p.f === 'I') {
                switch(p.s) {
                    case 1:
                        temp = {y1: p.y1 - 1, x1: p.x1 + 1, y2: p.y2, x2: p.x2, y3: p.y3 + 1, x3: p.x3 - 1, y4: p.y4 + 2, x4: p.x4 - 2, s: 2};
                        break;
                    case 2:
                        temp = {y1: p.y1 + 1, x1: p.x1 - 1, y2: p.y2, x2: p.x2, y3: p.y3 - 1, x3: p.x3 + 1, y4: p.y4 - 2, x4: p.x4 + 2, s: 1};
                        break;
                }
            }
            if(p.f === 'S') {
                switch(p.s) {
                    case 1:
                        temp = {y1: p.y1, x1: p.x1, y2: p.y2 + 1, x2: p.x2 - 1, y3: p.y3, x3: p.x3 + 2, y4: p.y4 + 1, x4: p.x4 + 1, s: 2};
                        break;
                    case 2:
                        temp = {y1: p.y1, x1: p.x1, y2: p.y2 - 1, x2: p.x2 + 1, y3: p.y3, x3: p.x3 - 2, y4: p.y4 - 1, x4: p.x4 - 1, s: 1};
                        break;
                }
            }
            if(p.f === 'iS') {
                switch(p.s) {
                    case 1:
                        temp = {y1: p.y1, x1: p.x1 + 1, y2: p.y2 + 1, x2: p.x2 - 1, y3: p.y3, x3: p.x3, y4: p.y4 + 1, x4: p.x4 - 2, s: 2};
                        break;
                    case 2:
                        temp = {y1: p.y1, x1: p.x1 - 1, y2: p.y2 - 1, x2: p.x2 + 1, y3: p.y3, x3: p.x3, y4: p.y4 - 1, x4: p.x4 + 2, s: 1}
                        break;
                }
            }
            if(p.f === 'O') {
                return;
            }
            if(this.checkEdge(temp, 't')) return;
            this.figure.set({y1: temp.y1, x1: temp.x1, y2: temp.y2, x2: temp.x2, y3: temp.y3, x3: temp.x3, y4: temp.y4, x4: temp.x4, s: temp.s}, {validate:true});
        }

        if(e.keyCode === 37) {
            if(this.checkEdge(this.figure, 'm')) return;
            var temp = this.figure.toJSON();
            this.figure.set({y1: temp.y1, x1: temp.x1-1, y2: temp.y2, x2: temp.x2-1, y3: temp.y3, x3: temp.x3-1, y4: temp.y4, x4: temp.x4-1}, {validate:true});
        }

        if(e.keyCode === 39) {
            if(this.checkEdge(this.figure, 'p')) return;
            var temp = this.figure.toJSON();
            this.figure.set({y1: temp.y1, x1: temp.x1+1, y2: temp.y2, x2: temp.x2+1, y3: temp.y3, x3: temp.x3+1, y4: temp.y4, x4: temp.x4+1}, {validate:true});
        }

        if(e.keyCode === 40) {
            if(this.checkEdge(this.figure, 'd')) return;
            var temp = this.figure.toJSON();
            this.figure.set({y1: temp.y1+1, x1: temp.x1, y2: temp.y2+1, x2: temp.x2, y3: temp.y3+1, x3: temp.x3, y4: temp.y4+1, x4: temp.x4}, {validate:true});
        }
    }
});

var gameCoreView = new GameCoreView({
    model: gameCoreModel
});

/*---------------------------------------------PAUSE ------------------------------------------ */
var PauseView = Backbone.View.extend({
    el: '.pause',
    events: {
        'click' : 'onOff'
    },
    onOff: function() {
        this.model.set('pause', !this.model.get('pause'))
    }
});
var pauseView = new PauseView({model: globalModel});

/* -----------------------------------------------START --------------------------------------------------------*/
var StartModel = Backbone.Model.extend({
    default: {
        show: true,
        gameON: false
    }
});
var StartView = Backbone.View.extend({
    el: '.startWindow',
    events: {
        'click .buttonStart' : 'startGame'
    },
    initialize: function() {
        this.listenTo(this.model, 'change:show', this.render)
    },
    render: function() {
        var self = this;
        if(this.model.get('show') === true) {
            self.el.style.display = 'block';
            setTimeout(function() {
                self.el.classList.add('show');
            }, 30);
        } else {
            this.el.classList.remove('show');
            setTimeout(function() {
                self.el.style.display = 'none';
            }, 700);
        }
    },
    startGame: function() {
        if(this.model.get('gameON')) return;
        this.model.set('gameON', true);
        var name = this.el.querySelector('input').value,
            self = this;
        if(!name) return false;
        infoModel.set({name: name, points: 0, lvl: 1, count: 0, speed: 700});
        this.model.set('show', false);
        arr = arrBuilder();
        setTimeout(function() {
            globalModel.set('gameON', true);
        }, 700);
    }
});

var startModel = new StartModel();

new StartView({
    model: startModel
});
 /* ----------------------------------------------------------END -----------------------------------------------*/ 

var endModel = new StartModel({
    show: false
});

var EndView = Backbone.View.extend({
    el: '.endWindow',
    events: {
        'click .buttonStart' : 'tryAgain'
    },
    initialize: function() {
        this.listenTo(this.model, 'change:show', this.render)
    },
    render: function() {
        var self = this;
        if(this.model.get('show') === true) {
            this.el.querySelector('h1 span:last-child').innerHTML = infoModel.get('name');
            this.el.querySelector('.score p:last-child').innerHTML = infoModel.get('points');
            this.el.style.display = 'block';
            setTimeout(function() {
                self.el.classList.add('show');
            }, 30);
        } else {
            this.el.classList.remove('show');
            setTimeout(function() {
                self.el.style.display = 'none';
            }, 700);
        }
    },
    tryAgain: function() {
        this.model.set('show', false);
        startModel.set('gameON', false);
        startModel.set('show', true);
    }
});

new EndView({
    model: endModel
});






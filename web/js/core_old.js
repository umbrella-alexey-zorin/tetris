
    /*===============================================SUPPORT=====================================================*/

    function tableBuilder (x, y, selector) {
        var table = '<table><tbody>',
            i, j, elem;
        for(i = 0; i < y; i++ ) {
            table += '<tr>';
            for(j = 0; j < x; j++ ) {
               
                    elem = '<td></td>';
               
                table += elem;
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

   /*================================================GAME=========================================================*/

    var arr;

    /*var FigureModel = Backbone.Model.extend({
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
    });*/


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


    /* --------------------------------------GAME CORE -------------------------------------------------------*/

    var GameCoreModel = Backbone.Model.extend({});
    var gameCoreModel = new GameCoreModel({
        gameON: false,
        pause: false
    });


    var GameCoreView = Backbone.View.extend({
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
                arr = arrBuilder();
                infoModel.set({name: name, points: 0, lvl: 1, count: 0, speed: 700});
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
                figure = this.model.get('nextFigure'), // figure = this.nextFigure.toJSON(),
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
        figureBuilder: function() {
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
            return temp;
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
            if(!this.model.get('nextFigure')) { //if(!this.nextFigure)
                this.model.set('nextFigure', this.figureBuilder()); //this.nextFigure = new FigureModel();
                this.model.set('figure', this.figureBuilder()); //this.figure = new FigureModel();
            } else {
                this.model.set('figure', this.model.get('nextFigure')); // this.figure = this.nextFigure;
                this.model.set('nextFigure', this.figureBuilder()); //this.nextFigure = new FigureModel();
            }
            this.trigger('change:nextFigure');
            this.listenTo(this.figure, 'change', this.AllChange); // this.listenTo(this.figure, 'change', this.AllChange);
            this.setChanges(this.figure, true); // this.setChanges(this.figure, true);
            this.render(this.figure, true); // this.render(this.figure, true);
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

    /*--------------------------------------------- START and PAUSE ------------------------------------------ */
    var ControlView = Backbone.View.extend({
        el: '.control',
        events: {
            'click .pause' : 'pause',
            'click .startgame' : 'startgame'
        },
        pause: function() {
        	if(!this.model.get('gameON')) return;
            this.model.set('pause', !this.model.get('pause'));
        },
        startgame: function() {
        	if(this.model.get('gameON')) return;
        	this.model.set('gameON', !this.model.get('gameON'));
        }
    });
    var controlView = new ControlView({model: gameCoreModel});
  
    /* ----------------------------------------------------------END -----------------------------------------------*/





    /*========================================== CONTROLS =================================================*/

    var templateMy = '<td><%= score %></td><td><%= date %></td>';
    var templateTop = '<td><%= name %></td><td><%= score %></td>';

    var MyScoreModel = Backbone.Model.extend({
        default: {score: '', date: ''}
    });

    var TopScoreModel = Backbone.Model.extend({
        default: {name: '', score: ''}
    });

    var MyScoreCollection = Backbone.Collection.extend({
        model : MyScoreModel,
        url: '/scripts/my_score.php'
    });

    var TopScoreCollection = Backbone.Collection.extend({
        model: TopScoreModel,
        url: '/scripts/top_score.php'
    });

    var myScoreCollection = new MyScoreCollection();

    var topScoreCollection = new TopScoreCollection();

    var MyScoreModelView = Backbone.View.extend({
        tagName: 'tr',
        template: _.template(templateMy),
        render: function() {
            this.el.innerHTML =  this.template(this.model.toJSON());
            return this;
        },
        initialize: function() {
            this.render();
        }
    });

    var TopScoreModelView = Backbone.View.extend({
        tagName: 'tr',
        template: _.template(templateTop),
        render: function() {
            this.el.innerHTML =  this.template(this.model.toJSON());
            return this;
        },
        initialize: function() {
            this.render();
        }
    });

    var MyScoreCollectionView = Backbone.View.extend({
        tagName: 'tbody',
        render: function() {
            this.el.innerHTML = '';
            this.collection.each(function(score) {
                var myScoreModelView = new MyScoreModelView({model: score});
                this.$el.append(myScoreModelView.render().el);
            }, this);
            return this;
        }
    });

    var TopScoreCollectionView = Backbone.View.extend({
        tagName: 'tbody',
        render: function() {
            this.el.innerHTML = '';
            this.collection.each(function(score) {
                var topScoreModelView = new TopScoreModelView({model: score});
                this.$el.append(topScoreModelView.render().el);
            }, this);
            return this;
        }
    });

    var GlobalView = Backbone.View.extend({
        initialize: function(){
            this.on("change:page", function() {
                if(this.page == 'startgame') {
                    this.renderGame();
                } else {
                    this.changeTemplate();
                    this.render();
                }
            }, this);
        },
        el: document.body,
        render: function() {
        	this.el.querySelector('#playGround').style.display = 'none';
        	this.el.querySelector('#playGround').classList.remove('show');
            this.el.querySelector('.infomodel').innerHTML = this.template;
            var elem = this.el.querySelector('.info');
            elem.classList.add(this.page);
            setTimeout(function() {
                elem.classList.add('show');
            }, 30);
            var self = this;
            var view = new this.view({
                collection: self.collection
            });
            this.collection.fetch({reset: true});
            this.collection.once('reset', function() {
                elem.querySelector('table').appendChild(view.render().el);
            }, this);
        },
        changeTemplate: function() {
            switch(this.page) {
                case 'myscore' : this.template = '<div class="info"><h1>MY SCORE</h1><hr><table><thead><tr><th>Score</th><th>Date</th></tr></thead></table></div>';
                    this.view = MyScoreCollectionView;
                    this.collection = myScoreCollection;
                    break;
                case 'topscore' : this.template = '<div class="info"><h1>TOP SCORE</h1><hr><table><thead><tr><th>Name</th><th>Score</th></tr></thead></table></div>';
                    this.view = TopScoreCollectionView;
                    this.collection = topScoreCollection;
                    break;
            }
        },
        renderGame: function() {
        	this.el.querySelector('.infomodel').innerHTML = '';
            var elem = this.el.querySelector('#playGround');
            elem.style.display = 'block';
            setTimeout(function() {
                elem.classList.add('show');
            }, 30);
            //arr = arrBuilder();
            //
        }

    });

    var globalView = new GlobalView();

    var Route = Backbone.Router.extend({
        routes: {
            'myscore' : 'myscore',
            'topscore' : 'topscore',
            'startgame' : 'startgame'
        },
        myscore: function() {
            globalView.page = 'myscore';
            globalView.trigger("change:page");
            if(gameCoreModel.get('gameON')) {
            	gameCoreModel.set('pause', true);
            }
        },
        topscore: function() {
            globalView.page = 'topscore';
            globalView.trigger("change:page");
            if(gameCoreModel.get('gameON')) {
            	gameCoreModel.set('pause', true);
            }
        },
        startgame: function() {
            globalView.page = 'startgame';
            globalView.trigger("change:page");
         }
    });

    new Route();
    Backbone.history.start();

/*********/
var EndModel = Backbone.Model.extend({});
var endModel = new EndModel({
        show: false
    });

    var EndView = Backbone.View.extend({
        el: '.wrapEndWindow',
        events: {
            'click .close' : 'close'
        },
        initialize: function() {
            this.listenTo(this.model, 'change:show', this.render)
        },
        render: function() {
            var self = this;
            if(this.model.get('show') === true) {
                this.el.querySelector('h1').innerHTML = infoModel.get('name');
                this.el.querySelector('.endWindow div').innerHTML = infoModel.get('points');
                myScoreCollection.create({
                	user: infoModel.get('name'), //обновить
                	score: infoModel.get('points') // обновить
                });
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
        close: function() {
            this.model.set('show', false);
            this.render();
        }
    });

    var endView = new EndView({
        model: endModel
    });




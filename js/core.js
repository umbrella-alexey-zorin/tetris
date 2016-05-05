$(function() {
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
    
    /* --------------------------------------GAME CORE -------------------------------------------------------*/

    var GameCoreModel = Backbone.Model.extend({
    	url: '/saveGame/',
        parse: function(response) {
            for(var key in response) {
                response[key] = JSON.parse(response[key]);
            }
            return response;
        }

    });
    var gameCoreModel = new GameCoreModel({
        gameON: false,
        pause: false,
        figure: '',
        nextFigure: '',
        points: 0,
        lvl: 1,
        count: 0,
        speed: 700,
        arr: ''
      });


    var GameCoreView = Backbone.View.extend({
        el: document.querySelector('.tableWrap tbody'),
        initialize: function() {
            var self = this;
            this.newEventKey = _.bind(this.eventKey, this);
            this.model.on('change:nextFigure', this.renderNextFigure, this);
            this.model.on('change:figure', this.AllChange, this);
            this.model.on('change:count', this.checkUpLvl, this);
            this.model.on('change:gameON', this.startEndGame, this);
            this.model.on('change:pause', this.pause, this);
            this.model.fetch({
                silent: true,
                success: function() {
                    self.updateField(self.model.get('arr'));
                    self.renderNextFigure();
                    self.model.trigger('change:points');
                    self.model.trigger('change:lvl');
                    self.model.trigger('change:valueButton');
                }
            });

        },
        startEndGame: function() {
            var state = this.model.get('gameON');
            if(state) {
            	clearTimeout(this.timerID);
            	document.addEventListener('keydown', this.newEventKey);
                this.clearField();
                this.model.set('arr', arrBuilder());
                this.model.set({points: 0, lvl: 1, count: 0, speed: 700});
                this.getFigure();
                this.model.trigger('change:valueButton');
            } 
        },
        pause: function() {
            if(this.model.get('pause')) {
            	this.model.save();
                document.removeEventListener('keydown', this.newEventKey);
                clearTimeout(this.timerID);
            } else {
                document.addEventListener('keydown', this.newEventKey);
                this.move();
            }
            this.model.trigger('change:valueButton'); 
        },
        checkUpLvl: function() {
            var model = this.model.toJSON();
            if(model.count/model.lvl >= 30) {
                this.model.set({lvl: model.lvl + 1, speed: model.speed - 50});
            }
        },
        renderNextFigure: function() {
            var elem = document.querySelector('.preview tbody'),
                figure = this.model.get('nextFigure'), 
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
            var arr = this.model.get('arr'),
            	count = 0,
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
            this.model.set('points', this.model.get('points') + points);
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
            if(!this.model.get('nextFigure')) {
                this.model.set('nextFigure', this.figureBuilder());
                this.model.set('figure', this.figureBuilder());
            } else {
                this.model.set('figure', this.model.get('nextFigure'), {silent: true});
                this.model.set('nextFigure', this.figureBuilder());
            }
            this.setChanges(true);
            this.render(true);
            if(this.checkEdge('d')) {
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
        render: function(attr) {
            var obj = (attr) ? this.model.get('figure') : this.model.previousAttributes().figure,
                i;
            for(i = 4; i > 0; i--) {
                this.el.rows[obj['y'+i]].cells[obj['x'+i]].className = (attr) ? obj.c : '';
            }
        },
        setChanges: function(attr) {
            var obj = (attr) ? this.model.get('figure') : this.model.previousAttributes().figure,
            	arr = this.model.get('arr'),
                i;
            for(i = 4; i > 0; i--) {
                arr[obj['y'+i]][obj['x'+i]] = (attr) ? {f: obj.f, s: obj.s, c: obj.c} : false;
            }
        },
        move: function() {
            var self = this;
            function moven() {
                var figure = self.model.get('figure');
                if(self.checkEdge('d')) {
                    this.access = false;
                    self.toFrozen();
                    self.lineHunter();
                    self.model.set('count', self.model.get('count') + 1);
                    self.getFigure();
                    return;
                }
                self.model.set('figure', {y4: figure['y4'] + 1, y3: figure['y3'] + 1, y2: figure['y2'] + 1,
                    y1: figure['y1'] + 1, x4: figure['x4'], x3: figure['x3'], x2: figure['x2'], x1: figure['x1'],
                    c: figure['c'], f: figure['f'], s: figure['s']});
                self.timerID = setTimeout(moven, self.model.get('speed'));
            }
            self.timerID = setTimeout(moven, self.model.get('speed'));
        },
        AllChange: function() {
            if(this.model.previousAttributes().figure) this.setChanges(false);
            this.setChanges(true);
            if(this.model.previousAttributes().figure) this.render(false);
            this.render(true);
        },
        checkEdge: function(p, model) {
            var temp = (model) ? model : _.clone(this.model.get('figure')),
            	arr = this.model.get('arr'),
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
        toFrozen: function() {
            var obj = this.model.get('figure'),
            	arr = this.model.get('arr'),
                i;
            for(i = 4; i > 0; i--) {
                arr[obj['y'+i]][obj['x'+i]].frozen = true;
            }
        },
        eventKey: function(e) {
            if(e.keyCode === 38) {
                var p = this.model.get('figure'),
                    temp;
                if(p.f === 'L') {
                    switch(p.s) {
                        case 1:
                            temp = {y1: p.y1 - 1, x1: p.x1 + 1, y2: p.y2, x2: p.x2, y3: p.y3 + 1, x3: p.x3 - 2, y4: p.y4, x4: p.x4 - 1, s: 2, };
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
                if(this.checkEdge('t', temp)) return;
                this.model.set('figure', {y1: temp.y1, x1: temp.x1, y2: temp.y2, x2: temp.x2, y3: temp.y3, x3: temp.x3, y4: temp.y4, x4: temp.x4, s: temp.s, c: p.c, f: p.f});
            }

            if(e.keyCode === 37) {
                if(this.checkEdge('m')) return;
                var temp = this.model.get('figure');
                this.model.set('figure', {y1: temp.y1, x1: temp.x1-1, y2: temp.y2, x2: temp.x2-1, y3: temp.y3, x3: temp.x3-1, y4: temp.y4, x4: temp.x4-1, s: temp.s, c: temp.c, f: temp.f});
            }

            if(e.keyCode === 39) {
                if(this.checkEdge('p')) return;
                var temp = this.model.get('figure');
                this.model.set('figure', {y1: temp.y1, x1: temp.x1+1, y2: temp.y2, x2: temp.x2+1, y3: temp.y3, x3: temp.x3+1, y4: temp.y4, x4: temp.x4+1, s: temp.s, c: temp.c, f: temp.f});
            }

            if(e.keyCode === 40) {
                if(this.checkEdge('d')) return;
                var temp = this.model.get('figure');
                this.model.set('figure', {y1: temp.y1+1, x1: temp.x1, y2: temp.y2+1, x2: temp.x2, y3: temp.y3+1, x3: temp.x3, y4: temp.y4+1, x4: temp.x4, s: temp.s, c: temp.c, f: temp.f});
            }
        }
    });

    var gameCoreView = new GameCoreView({
        model: gameCoreModel
    });

    /*------------------------------------------------------INFO ---------------------------------------------- */
    var InfoView = Backbone.View.extend({
        el: '.rightColumn',
        initialize: function() {
            this.model.on('change:points', function() {
                this.render('.points', 'points');
            }, this);
            this.model.on('change:lvl', function() {
                this.render('.level p:last-child', 'lvl');
            }, this);
        },
        render: function(selector, attr) {
            this.el.querySelector(selector).innerHTML = this.model.get(attr);
        }
     });

    var infoView = new InfoView({
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
            if(this.model.get('pause')) {
            	//this.model.save();
            }
            //this.model.trigger('change:valueButton'); 
        },
        setValueButton: function() { // Тригер!!!
        	if(this.model.get('pause')) {
            	this.el.querySelector('.pause').innerHTML = 'Продолжить';
            } else {														
            	this.el.querySelector('.pause').innerHTML = 'Пауза/Сохранить';
            }
        },
        startgame: function() {
        	if(this.model.get('gameON')) {
        		var act = confirm('У вас запущена игра, Вы уверены, что хотите начать новую игру?');
        		if(act) {
        			this.model.set('pause', false);
        			this.model.set('gameON', false);
        		} else {
        			return;
        		}
        	}
        	this.model.set('gameON', true);
        },
        initialize: function() {
        	this.model.on("change:valueButton", this.setValueButton, this);
        }
    });
    var controlView = new ControlView({model: gameCoreModel});

    /*========================================== CONTROLS =================================================*/

    var templateMy = '<td><%= score %></td><td><%= date %></td>';
    var templateTop = '<td><%= name %></td><td><%= score %></td>';

    var MyScoreModel = Backbone.Model.extend({
        default: {score: '', date: '', name: ''}
    });

    var TopScoreModel = Backbone.Model.extend({
        default: {name: '', score: ''}
    });

    var MyScoreCollection = Backbone.Collection.extend({
        model : MyScoreModel,
        url: '/score/getMyScore/'
    });

    var TopScoreCollection = Backbone.Collection.extend({
        model: TopScoreModel,
        url: '/score/getTopScore/'
    });

    var myScoreCollection = new MyScoreCollection();

    var topScoreCollection = new TopScoreCollection();

    var MyScoreModelView = Backbone.View.extend({
        tagName: 'tr',
        template: _.template(templateMy),
        render: function(i) {
            this.el.innerHTML =  '<td>' + i + '</td>' + this.template(this.model.toJSON());
            return this;
        },
        initialize: function() {
            this.render();
        }
    });

    var TopScoreModelView = Backbone.View.extend({
        tagName: 'tr',
        template: _.template(templateTop),
        render: function(i) {
            this.el.innerHTML = '<td>' + i + '</td>' + this.template(this.model.toJSON());
            return this;
        },
        initialize: function() {
            this.render();
        }
    });

    var MyScoreCollectionView = Backbone.View.extend({
        tagName: 'tbody',
        i:0,
        render: function() {
            this.el.innerHTML = '';
            var i = 1;
            this.collection.each(function(score) {
                var myScoreModelView = new MyScoreModelView({model: score});
                this.$el.append(myScoreModelView.render(i++).el);
            }, this);
            return this;
        }
    });

    var TopScoreCollectionView = Backbone.View.extend({
        tagName: 'tbody',
        render: function() {
            this.el.innerHTML = '';
            var i = 1;
            this.collection.each(function(score) {
                var topScoreModelView = new TopScoreModelView({model: score});
                this.$el.append(topScoreModelView.render(i++).el);
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
                case 'myscore' : this.template = '<div class="info"><h1>Мои достижения</h1><hr><table><thead><tr><th>№</th><th>Score</th><th>Дата</th></tr></thead></table></div>';
                    this.view = MyScoreCollectionView;
                    this.collection = myScoreCollection;
                    break;
                case 'topscore' : this.template = '<div class="info"><h1>TOP 10</h1><hr><table><thead><tr><th>Место</th><th>Имя</th><th>Score</th></tr></thead></table></div>';
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
                this.el.querySelector('.endWindow span').innerHTML = gameCoreModel.get('points');
                if(gameCoreModel.get('points') > 0) {
                	myScoreCollection.create({
                		user: '', 
                		score: gameCoreModel.get('points'),
                		date: ''
                	});
                }
                
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


}).ready();

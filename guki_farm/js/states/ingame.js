var InGame = {
	getGraphics: function() {
		return [
			'img/action_btn_feed.png',
			'img/action_circle.png',
			'img/bg.png',
			'img/hen.png',
			'img/hen_dead.png',
			'img/hen_eat.png',
			'img/need_icons_eat.png',
		];
	},

	getAnimations: function() {
		var animations = {};

		var action_btn_feed = new rtge.Animation();
		action_btn_feed.steps = ['img/action_btn_feed.png'];
		action_btn_feed.durations = [600000];
		animations['ingame.action.btns.feed'] = action_btn_feed;

		var action_circle = new rtge.Animation();
		action_circle.steps = ['img/action_circle.png'];
		action_circle.durations = [600000];
		animations['ingame.action.circle'] = action_circle;

		var hen_idle = new rtge.Animation();
		hen_idle.steps = ['img/hen.png'];
		hen_idle.durations = [600000];
		animations['ingame.hen.idle'] = hen_idle;

		var hen_dead = new rtge.Animation();
		hen_dead.steps = ['img/hen_dead.png'];
		hen_dead.durations = [600000];
		animations['ingame.hen.dead'] = hen_dead;

		var hen_eating = new rtge.Animation();
		hen_eating.steps = ['img/hen_eat.png'];
		hen_eating.durations = [600000];
		animations['ingame.hen.eating'] = hen_eating;

		var need_eat = new rtge.Animation();
		need_eat.steps = ['img/need_icons_eat.png'];
		need_eat.durations = [600000];
		animations['ingame.need_icons.eat'] = need_eat;

		return animations;
	},

	State: function() {
		// Data
		this.action_circle = null;
		this.focused_hen = null;

		// Methods
		this.tick = function(timeElapsed) {
		};

		this.worldClick = function(x, y) {
			this.removeActionCircle();
		};

		this.placeActionCircle = function(hen) {
			if (this.action_circle != null) {
				this.removeActionCircle();
			}
			this.action_circle = new InGame.ActionCircle(hen);
			rtge.addObject(this.action_circle);
			for (var btn_idx = 0; btn_idx < this.action_circle.btns.length; ++btn_idx) {
				rtge.addObject(this.action_circle.btns[btn_idx]);
			}
			this.focused_hen = hen;
		};

		this.removeActionCircle = function() {
			if (this.action_circle == null) {
				return;
			}

			rtge.removeObject(this.action_circle);
			for (var btn_idx = 0; btn_idx < this.action_circle.btns.length; ++btn_idx) {
				rtge.removeObject(this.action_circle.btns[btn_idx]);
			}

			this.action_circle = null;
			this.focused_hen = null;
		};

		this.actionFeed = function() {
			if (this.focused_hen == null) {
				return;
			}

			this.focused_hen.startEating();
		};

		// Initialization logic
		rtge.state.terrain = 'img/bg.png';
		for (var i = 0; i < 5; ++i) {
			rtge.addObject(new InGame.Hen(600, 500, this));
		}
	},

	Hen: function(x, y, scene) {
		// Data
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.anchorX = 50;
		this.anchorY = 90;
		this.animation = 'ingame.hen.idle';

		this.direction = {x: 1, y: 0};
		this.speed = 0.1;
		this.needs = {
			'food': {value: 0, speed:.1},
		};
		this.needIcons = {
			'food': new InGame.NeedIcon(this, 'ingame.need_icons.eat', 'food', 0, -40),
		};
		this.needIconsAppearing = false;
		this.scene = scene;
		this.state = null;

		// Methods
		this.tick = function(timeElapsed) {
			// Avoid huges steps (easily done by tab-switching)
			timeElapsed = Math.min(timeElapsed, 40);

			// Move the Hen
			switch (this.state.name) {
				case 'walking':
					this.updateDirection();
					this.x += this.direction.x * this.speed * timeElapsed;
					this.y += this.direction.y * this.speed * timeElapsed;
					break;
				case 'eating':
					this.state.counter -= timeElapsed;
					if (this.state.counter <= 0) {
						this.startWalking();
					}
					break;
			};

			// Handle needs
			for (need_name in this.needs) {
				var need = this.needs[need_name];
				need.value += need.speed;
				if (need.value >= 100) {
					this.die();
					return;
				}
			}
		};

		this.click = function() {
			this.scene.placeActionCircle(this);
			this.showNeeds();
		};

		this.mouseOver = function(mouse_pos) {
			this.showNeeds();
		};

		this.mouseNotOver = function(mouse_pos) {
			if (this.scene.focused_hen !== this) {
				this.hideNeeds();
			}
		};

		this.showNeeds = function() {
			if (this.needIconsAppearing) {
				return;
			}
			this.needIconsAppearing = true;

			for (var need_name in this.needIcons) {
				rtge.addObject(this.needIcons[need_name]);
			}
		};

		this.hideNeeds = function() {
			if (! this.needIconsAppearing) {
				return;
			}
			this.needIconsAppearing = false;

			for (var need_name in this.needIcons) {
				rtge.removeObject(this.needIcons[need_name]);
			}
		};

		this.startWalking = function() {
			this.animation = 'ingame.hen.idle';
			this.state = {name: 'walking'};
		};

		this.startEating = function() {
			this.state = {name: 'eating', counter: 1000};
			this.animation = 'ingame.hen.eating';
			this.needs['food'].value = 0;
		};

		this.die = function() {
			if (this.scene.focused_hen === this) {
				this.scene.removeActionCircle();
			}

			this.hideNeeds();
			rtge.removeObject(this);
			rtge.addObject(new InGame.DeadHen(this));
		};

		this.updateDirection = function() {
			var momentum = this.direction;
			var random = this.getRandomDirection();
			var flee_fence = this.getFleeFenceDirection();

			this.direction = Utils.normalize({
				x: momentum.x*1 + random.x*0.5 + flee_fence.x*1,
				y: momentum.y*1 + random.y*0.5 + flee_fence.y*1
			});
		};

		this.getRandomDirection = function() {
			return Utils.normalize({
				x: Math.random() * 2 - 1,
				y: Math.random() * 2 - 1
			});
		};

		this.getFleeFenceDirection = function() {
			// Fence lines as equations of the "ax + by + c = 0" form
			//  Isometric use 30° lines, so it makes for equation
			//  "y = tan(30)*x + c" for a growing line, "y = -tan(30)*x + c"
			//  for a declining line. "c" being the "y" value for the point at "x = 0".
			var fence_nw = {a: .58, b: 1, c: -535};
			var fence_ne = {a: -.58, b: 1, c: 535};
			var fence_se = {a: .58, b: 1, c: -535*3};
			var fence_sw = {a: -.58, b: 1, c: -535};

			var direction = Utils.normalize({
				x:
					1 / Utils.distanceFromLine(fence_nw, this) +
					1 / Utils.distanceFromLine(fence_sw, this) +
					-1 /  Utils.distanceFromLine(fence_ne, this) +
					-1 /  Utils.distanceFromLine(fence_se, this),
				y:
					1 / Utils.distanceFromLine(fence_nw, this) +
					1 /  Utils.distanceFromLine(fence_ne, this) +
					-1 / Utils.distanceFromLine(fence_sw, this) +
					-1 /  Utils.distanceFromLine(fence_se, this),
			});

			var intensity = 3 / Math.min(
				Utils.distanceFromLine(fence_nw, this),
				Utils.distanceFromLine(fence_ne, this),
				Utils.distanceFromLine(fence_se, this),
				Utils.distanceFromLine(fence_sw, this)
			);

			if (intensity < .3) {
				return {x: 0, y: 0};
			}
			return {x: direction.x * intensity, y: direction.y * intensity};
		};

		// Initialization logic
		this.startWalking();
	},

	DeadHen: function(hen) {
		rtge.DynObject.call(this);
		this.x = hen.x;
		this.y = hen.y;
		this.anchorX = 50;
		this.anchorY = 90;
		this.animation = 'ingame.hen.dead';

		this.speed = 0.3;

		this.tick = function(timeElapsed) {
			this.y -= this.speed * timeElapsed;
			if (this.y < -10) {
				rtge.removeObject(this);
			}
		};
	},

	NeedIcon: function(hen, animation, need_name, x, y) {
		rtge.DynObject.call(this);
		this.x = hen.x + x;
		this.y = hen.y + y;
		this.z = 1;
		this.anchorX = 15;
		this.anchorY = 15;
		this.animation = animation;

		this.hen = hen;
		this.need_name = need_name;
		this.offset_x = x;
		this.offset_y = y;

		this.tick = function(timeElapsed) {
			this.x = this.hen.x + this.offset_x;
			this.y = this.hen.y + this.offset_y;
		};

		this.preDraw = function() {
			var red = 255;
			var blue = 255;
			var factor;
			var need_value = this.hen.needs[this.need_name].value;
			if (need_value <= 50) {
				factor = need_value / 50.;
				red *= factor;
			}else {
				factor = 1 - (need_value - 50.) / 50.;
				blue *= factor;
			}
			rtge.canvasCtx.fillStyle = 'rgb('+Math.floor(red)+','+Math.floor(blue)+',0)';
			rtge.canvasCtx.fillRect(this.x - this.anchorX, this.y - this.anchorY, 30, 30);
		};
	},

	ActionCircle: function(hen) {
		rtge.DynObject.call(this);
		this.x = hen.x;
		this.y = hen.y - 40;
		this.z = 1;
		this.anchorX = 250;
		this.anchorY = 250;
		this.animation = 'ingame.action.circle';

		this.hen = hen;
		var scene = this.hen.scene;
		this.btns = [
			new InGame.ActionBtn(this, 0, -150, 'ingame.action.btns.feed', function() {scene.actionFeed();}),
			new InGame.ActionBtn(this, 150, 0, 'ingame.action.btns.feed', function() {scene.actionFeed();}),
			new InGame.ActionBtn(this, 0, 150, 'ingame.action.btns.feed', function() {scene.actionFeed();}),
			new InGame.ActionBtn(this, -150, 0, 'ingame.action.btns.feed', function() {scene.actionFeed();}),
		];

		this.tick = function(timeElapsed) {
			this.x = hen.x;
			this.y = hen.y - 40;
		};
	},

	ActionBtn: function(action_circle, x, y, animation, callback) {
		rtge.DynObject.call(this);
		this.x = action_circle.x + x;
		this.y = action_circle.y + y;
		this.z = 2;
		this.anchorX = 50;
		this.anchorY = 50;
		this.animation = animation;

		this.offset_x = x;
		this.offset_y = y;
		this.callback = callback;

		this.tick = function(timeElapsed) {
			this.x = action_circle.x + this.offset_x;
			this.y = action_circle.y + this.offset_y;
		};

		this.click = function() {
			this.callback();
		};
	},
};

var InGame = {
	getGraphics: function() {
		return [
			'img/bg.png',
			'img/hen.png',
		];
	},

	getAnimations: function() {
		var animations = {};

		var hen_idle = new rtge.Animation();
		hen_idle.steps = ['img/hen.png'];
		hen_idle.durations = [600000];
		animations['ingame.hen.idle'] = hen_idle;

		return animations;
	},

	State: function() {
		this.tick = function(timeElapsed) {
		};

		rtge.state.terrain = 'img/bg.png';
		for (var i = 0; i < 100; ++i) {
			rtge.addObject(new InGame.Hen(600, 500));
		}
	},

	Hen: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.anchorX = 50;
		this.anchorY = 90;
		this.animation = 'ingame.hen.idle';

		this.direction = {x: 1, y: 0};
		this.speed = 0.2;

		this.tick = function(timeElapsed) {
			timeElapsed = Math.min(timeElapsed, 40);

			this.updateDirection();

			this.x += this.direction.x * this.speed * timeElapsed;
			this.y += this.direction.y * this.speed * timeElapsed;
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
	}
};

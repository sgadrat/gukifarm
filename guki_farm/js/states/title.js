var Title = {
	getGraphics: function() {
		return [
			'img/title/title.png',
			'img/title/start.png',
		];
	},

	getAnimations: function() {
		var animations = {};

		var anim = new rtge.Animation();
		anim.steps = ['img/title/start.png'];
		anim.durations = [600000];
		animations['title.start'] = anim;

		anim = new rtge.Animation();
		anim.steps = ['img/title/title.png'];
		anim.durations = [600000];
		animations['title.title'] = anim;

		return animations;
	},

	State: function() {
		// Data
		this.firstTime = true;

		// Methods
		this.tick = function(timeElapsed) {
			if (this.firstTime) {
				this.firstTime = false;
				document.getElementById('music').play();
			}
		};

		this.worldClick = function(x, y) {
		};

		// Initialization logic
		rtge.state.terrain = 'img/bg.png';
		var lower_fence = new rtge.DynObject();
		lower_fence.animation = 'ingame.environment.lower_fence';
		lower_fence.z = 0;
		rtge.addObject(lower_fence);

		rtge.addObject(new Title.Start());
		rtge.addObject(new Title.GameTitle());
	},

	Start: function() {
		rtge.DynObject.call(this);
		this.x = 500;
		this.y = 790;
		this.z = 1000;
		this.animation = 'title.start';

		this.click = function() {
			Guki.changeState('ingame');
			document.getElementById('btn_click').play();
		};
	},

	GameTitle: function() {
		rtge.DynObject.call(this);
		this.x = 360;
		this.y = 40;
		this.z = 1000;
		this.animation = 'title.title';
	},
};

var Title = {
	getGraphics: function() {
		return [
			'img/title/title.png',
		];
	},

	getAnimations: function() {
		var animations = {};

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
			Guki.changeState('ingame');
			document.getElementById('btn_click').play();
		};

		// Initialization logic
		rtge.state.terrain = 'img/bg.png';
		var lower_fence = new rtge.DynObject();
		lower_fence.animation = 'ingame.environment.lower_fence';
		lower_fence.z = 0;
		rtge.addObject(lower_fence);

		rtge.addObject(new Title.GameTitle());
	},

	GameTitle: function() {
		rtge.DynObject.call(this);
		this.x = 0;
		this.y = 0;
		this.z = 1000;
		this.animation = 'title.title';
	},
};

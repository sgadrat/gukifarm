var Title = {
	getGraphics: function() {
		return [
			'img/title.png',
		];
	},

	getAnimations: function() {
		return {};
	},

	State: function() {
		// Methods
		this.tick = function(timeElapsed) {
		};

		this.worldClick = function(x, y) {
			Guki.changeState('ingame');
		};

		// Initialization logic
		rtge.state.terrain = 'img/title.png';
	},
};

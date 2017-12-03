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
		};

		// Initialization logic
		rtge.state.terrain = 'img/title.png';
	},
};

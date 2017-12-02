var Guki = {
	state: null,

	init: function() {
		var graphics = [
			'img/bg.png',
		];
		var animations = [];

		rtge.init(
			'view',
			{
				'terrain': 'img/bg.png',
				'objects': [],
			},
			animations,
			[],
			graphics,
			{
				'globalTick': Guki.tick
			},
			new rtge.Camera()
		);

		Guki.state = new InGame.State();
	},

	tick: function(timeElapsed) {
		Guki.state.tick(timeElapsed);
	},
};

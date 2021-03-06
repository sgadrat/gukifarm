var Guki = {
	state: null,
	statesFactories: null,

	init: function() {
		Guki.statesFactories = {
			'ingame': InGame,
			'title': Title,
		};

		var graphics = [];
		var animations = {};

		for (var state_name in Guki.statesFactories) {
			var factory = Guki.statesFactories[state_name];
			graphics = graphics.concat(factory.getGraphics());
			animations = Object.assign(animations, factory.getAnimations());
		}

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
				'globalTick': Guki.tick,
				//'postRender': Guki.debugOverlay,
				'worldClick': Guki.worldClick,
			},
			new rtge.Camera()
		);

		Guki.state = new Title.State();
	},

	changeState: function(newStateName) {
		rtge.state.objects = [];
		Guki.state = new Guki.statesFactories[newStateName].State();
	},

	tick: function(timeElapsed) {
		Guki.state.tick(timeElapsed);
	},

	debugOverlay: function() {
		var fence_nw = {a: .58, b: 1, c: -670};
		var fence_ne = {a: -.58, b: 1, c: 399};
		var fence_se = {a: .58, b: 1, c: -1569};
		var fence_sw = {a: -.58, b: 1, c: -496};

		for (var x = 0; x < 1860; ++x) {
			for (var y = 0; y < 1080; ++y) {
				if (Utils.distanceFromLine(fence_nw, {x: x, y: y}) <= 4) {
					rtge.canvasCtx.fillStyle = 'red';
					rtge.canvasCtx.fillRect(x, y, 1, 1);
				}
				if (Utils.distanceFromLine(fence_ne, {x: x, y: y}) <= 4) {
					rtge.canvasCtx.fillStyle = 'blue';
					rtge.canvasCtx.fillRect(x, y, 1, 1);
				}
				if (Utils.distanceFromLine(fence_se, {x: x, y: y}) <= 4) {
					rtge.canvasCtx.fillStyle = 'black';
					rtge.canvasCtx.fillRect(x, y, 1, 1);
				}
				if (Utils.distanceFromLine(fence_sw, {x: x, y: y}) <= 4) {
					rtge.canvasCtx.fillStyle = 'brown';
					rtge.canvasCtx.fillRect(x, y, 1, 1);
				}
			}
		}
	},

	worldClick: function(x, y) {
		Guki.state.worldClick(x, y);
	},
};

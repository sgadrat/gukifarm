var Guki = {
	state: null,

	init: function() {
		var graphics = [];
		var animations = {};

		graphics = graphics.concat(InGame.getGraphics());
		animations = Object.assign(animations, InGame.getAnimations());

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
				//'postRender': Guki.debugOverlay
			},
			new rtge.Camera()
		);

		Guki.state = new InGame.State();
	},

	tick: function(timeElapsed) {
		Guki.state.tick(timeElapsed);
	},

	debugOverlay: function() {
		var fence_nw = {a: .58, b: 1, c: -535};
		var fence_ne = {a: -.58, b: 1, c: 535};
		var fence_se = {a: .58, b: 1, c: -535*3};
		var fence_sw = {a: -.58, b: 1, c: -535};

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
	}
};

var Utils = {
	normalize: function(vector) {
		if (vector.x == 0 && vector.y == 0) {
			return {x: 0, y: 0};
		}

		var factor = 1. / (Math.abs(vector.x) + Math.abs(vector.y));
		return {x: vector.x * factor, y: vector.y * factor};
	},

	// Compute distance of a point to a line defined by the equation "ax + by + c = 0"
	distanceFromLine: function(line, point) {
		return (
			Math.abs(line.a * point.x + line.b * point.y + line.c) /
			Math.sqrt(Math.pow(line.a, 2) + Math.pow(line.b, 2))
		);
	},
};

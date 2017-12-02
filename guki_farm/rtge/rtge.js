var rtge = {
	// A graphical animation
	Animation: function() {
		this.steps = []; ///< urls of images for each step
		this.durations = []; ///< duration, in milliseconds for each steps
	},

	// An interactive object in the game
	DynObject: function() {
		this.animation = null; ///< string, name of the current animation
		this.animationPosition = 0; ///< number of milliseconds since the start of the animation
		this.x = 0; ///< horizontal position on the map
		this.y = 0; ///< vertical position on the map
		this.z = 0; ///< objects with greater z value are drown on top of others
		this.anchorX = 0; ///< horizontal position of the anchor point on the object
		this.anchorY = 0; ///< vertical position of the anchor point on the object
		this.visible = true; ///< is the object drawn and clickable
		this.tick = null; ///< function called to update the object for the next frame
		this.click = null; ///< function called when the object is left clicked
		this.mouseOver = null; ///< function called when the mouse moves over the object, param is world pos of the mouse
		this.mouseNotOver = null; ///< function called when the mouse moves outside the object, param is world pos of the mouse
		this.preDraw = null; ///< function called just before drawing the object, no param
	},

	// A camera viewing the scene
	Camera: function() {
		this.x = 0; ///< horizontal position in world coordinate
		this.y = 0; ///< vertical position in world coordinated
		this.worldMouseDown = null; ///< callback for mouse down outside of interface
		this.mouseUp = null; ///< callback for mouseUp
		this.mouseMove = null; ///< callback for mouseMove
		this.tick = null; ///< callback for engine tick
	},

	// A GUI element
	// Positions and dimension are given in Relative PiXel (rpx)
	// a rpx is the 1/1000 of the minimum pixel size between viewport's height and width
	InterfaceElement: function() {
		this.anchorTop = true; ///< is the element position relative to the top of the view ? (else it is relative to the bottom)
		this.anchorLeft = true; ///< is the element position relative to the left of the view ? (else it is relative to the right)
		this.x = 0; ///< horizontal offset, in rpx
		this.y = 0; ///< vertical offset, in rpx
		this.width = 0; ///< width of the graphical element, in rpx
		this.height = 0; ///< height of the graphical element, in rpx
		this.image = null; ///< url of the image representing the element at rest
		this.imageOver = null; ///< url of the image representing the element when mouse is over, null for no special image
		this.imageClick = null; ///< url of the image representing the element when clicking on it, null for no special image
		this.click = null; ///< function called on click, take params (x, y) in rpx from the topleft of the element
		this.state = 'rest'; ///< state of the element : rest=nothing special, over=mouse is over, click=being clicked (internally handled)
	},

	init: function(canvasId, initialState, animations, graphicInterface, preloads, callbacks, camera) {
		// Set the initial game state
		rtge.state = initialState;
		rtge.state.objects.sort(function (a,b) {return a.z-b.z;});
		rtge.graphicInterface = graphicInterface;

		// Set engine initial state
		rtge.lastUpdate = Date.now();
		rtge.canvas = document.getElementById(canvasId);
		var style = getComputedStyle(rtge.canvas);
		rtge.canvas.width = 1860; //style.width.slice(0, style.width.length - 2);
		rtge.canvas.height = 1080; //style.height.slice(0, style.height.length - 2);
		rtge.canvasCtx = rtge.canvas.getContext('2d');
		rtge.animations = animations;

		// Set the camera
		if (typeof camera == 'undefined') {
			// Create a default camera
			camera = new rtge.Camera();
			camera.moving = false;
			camera.lastCursorPosition = null;
			camera.worldMouseDown = function(pos) {
				this.lastCursorPosition = pos;
				this.moving = true;
			};
			camera.mouseUp = function(pos) {
				this.moving = false;
			};
			camera.mouseMove = function(pos) {
				if (this.moving && this.lastCursorPosition != null) {
					var diffX = pos.x - this.lastCursorPosition.x;
					var diffY = pos.y - this.lastCursorPosition.y;
					this.x -= diffX;
					this.y -= diffY;
				}
				this.lastCursorPosition = pos;
			};
		}
		rtge.camera = camera;

		// Import callbacks
		if ('worldClick' in callbacks) {
			rtge.worldClick = callbacks.worldClick;
		}
		if ('globalTick' in callbacks) {
			rtge.globalTick = callbacks.globalTick;
		}
		if ('postRender' in callbacks) {
			rtge.postRender = callbacks.postRender;
		}

		// Add needed images to preloads
		var i;
		/* tilesets and component images */
		for (i = 0; i < preloads.length; ++i) {
			var asset = preloads[i];
			if (typeof asset != 'string') {
				if (asset.data.type == 'tilemap') {
					var tilesets = asset.data.tilemap.tilesets;
					for (var tilemapIndex = 0; tilemapIndex < tilesets.length; ++tilemapIndex) {
						var imgSrc = tilesets[tilemapIndex]['image'];
						if (imgSrc !== null) {
							preloads.push(imgSrc);
						}
					}
				}else if (asset.data.type == 'composite') {
					var components = asset.data.components;
					for (var compIndex = 0; compIndex < components.length; ++compIndex) {
						preloads.push(components[compIndex]);
					}
				}
			}
		}

		// Preload images
		for (i = 0; i < preloads.length; ++i) {
			var name = preloads[i];
			var data = null;
			if (typeof name != 'string') {
				name = preloads[i].name;
				data = preloads[i].data;
			}
			if (!(name in rtge.images)) {
				if (data === null) {
					rtge.images[name] = new Image();
					rtge.images[name].addEventListener('load', rtge.waitLoad, false);
					rtge.images[name].src = name;
				}else {
					rtge.images[name] = data;
				}
			}
		}
	},

	waitLoad: function() {
		var fullyLoaded = true;
		for (var i in rtge.images) {
			if (rtge.images[i] instanceof Image) {
				if (rtge.images[i].complete) {
					rtge.images[i].removeEventListener('load', rtge.waitLoad, false);
				}else {
					fullyLoaded = false;
				}
			}
		}

		if (fullyLoaded) {
			rtge.loaded();
		}
	},

	loaded: function() {
		// Setup event system
		rtge.canvas.addEventListener('mousedown', rtge.canvasMouseDown, false);
		rtge.canvas.addEventListener('touchstart', rtge.canvasTouchStart, false);
		rtge.canvas.addEventListener('mouseup', rtge.canvasMouseUp, false);
		rtge.canvas.addEventListener('touchend', rtge.canvasTouchEnd, false);
		rtge.canvas.addEventListener('mousemove', rtge.canvasMouseMove, false);
		rtge.canvas.addEventListener('touchmove', rtge.canvasTouchMove, false);
		window.addEventListener('resize', rtge.canvasResize, false);

		// Start engine
		rtge.run();
	},

	run: function() {
		window.requestAnimationFrame(rtge.run);
		rtge.update();
		rtge.render();
	},

	update: function() {
		var begin = Date.now();
		var timeDiff = begin - rtge.lastUpdate;
		if (rtge.globalTick != null) {
			rtge.globalTick(timeDiff);
		}
		for (var i = 0; i < rtge.state.objects.length; ++i) {
			var o = rtge.state.objects[i];
			o.animationPosition += timeDiff;
			if (o.tick != null) {
				o.tick(timeDiff);
			}
		}
		if (rtge.camera.tick != null) {
			rtge.camera.tick(timeDiff);
		}
		rtge.lastUpdate = begin;
	},

	render: function() {
		// Black background
		rtge.canvasCtx.fillStyle = '#000000';
		rtge.canvasCtx.fillRect(0, 0, rtge.canvas.width, rtge.canvas.height);

		// Map
		rtge.drawImage(rtge.state.terrain, -rtge.camera.x, -rtge.camera.y);

		// Dynamic objects
		var i;
		for (i = 0; i < rtge.state.objects.length; ++i) {
			var o = rtge.state.objects[i];
			if (o.visible) {
				// Get the image to print on this frame
				var img = rtge.getAnimationImage(o.animation, o.animationPosition);

				// Compute bounding box
				var imgPos = {
					x: o.x - o.anchorX - rtge.camera.x,
					y: o.y - o.anchorY - rtge.camera.y
				};
				var rightBound = imgPos.x + img.width;
				var bottomBound = imgPos.y + img.height;

				// Draw the image if at least partially in the viewport
				if (
					imgPos.x <= rtge.canvas.width &&
					imgPos.y <= rtge.canvas.height &&
					rightBound >= 0 &&
					bottomBound >= 0
				)
				{
					if (o.preDraw != null) {
						o.preDraw();
					}
					rtge.canvasCtx.drawImage(img, imgPos.x, imgPos.y);
				}
			}
		}

		// User interface
		for (i = 0; i < rtge.graphicInterface.length; ++i) {
			for (var j = 0; j < rtge.graphicInterface[i].length; ++j) {
				var elem = rtge.graphicInterface[i][j];
				var pos = rtge.interfaceElemPosition(elem);
				var stateImg = rtge.getImage(elem.image);
				if (elem.imageOver != null && elem.state == 'over') {
					stateImg = rtge.getImage(elem.imageOver);
				}else if (elem.imageClick != null && elem.state == 'click') {
					stateImg = rtge.getImage(elem.imageClick);
				}
				rtge.canvasCtx.drawImage(stateImg, pos.x, pos.y, rtge.rpxToPx(elem.width), rtge.rpxToPx(elem.height));
			}
		}

		// Overlay
		if (rtge.postRender != null) {
			rtge.postRender();
		}
	},

	interfaceElemPosition: function(o) {
		var res = {
			x: 0,
			y: 0
		};
		if (o.anchorLeft) {
			res.x = rtge.rpxToPx(o.x);
		}else {
			res.x = rtge.canvas.width - rtge.rpxToPx(o.x);
		}
		if (o.anchorTop) {
			res.y = rtge.rpxToPx(o.y);
		}else {
			res.y = rtge.canvas.height - rtge.rpxToPx(o.y);
		}
		return res;
	},

	rpxToPx: function(rpxVal) {
		var ref = Math.min(rtge.canvas.height, rtge.canvas.width) / 1000.;
		return Math.floor(rpxVal * ref);
	},

	pxToRpx: function(pxVal) {
		var ref = Math.min(rtge.canvas.height, rtge.canvas.width) / 1000.;
		return Math.ceil(pxVal / ref);
	},

	getCanvasPos: function(clientPos) {
		var rect = rtge.canvas.getBoundingClientRect();
		return {
			x: clientPos.x - rect.left,
			y: clientPos.y - rect.top
		};
	},

	canvasPosToWorldPos: function(pos) {
		var style = getComputedStyle(document.getElementById('view'));
		var canvas_width = style.width.slice(0, style.width.length - 2);
		var canvas_height = style.height.slice(0, style.height.length - 2);
		var internal_width = 1860;
		var internal_height = 1080;

		var internal_x = pos.x * (internal_width / canvas_width);
		var internal_y = pos.y * (internal_height / canvas_height);
		return {
			x: internal_x + rtge.camera.x,
			y: internal_y + rtge.camera.y
		};
	},

	// Return true if a dynamic object is at a world position
	objectIsAt: function(o, pos) {
		var imageX = o.x - o.anchorX;
		var imageY = o.y - o.anchorY;
		if (pos.x >= imageX && pos.y >= imageY) {
			var img = rtge.getAnimationImage(o.animation, o.animationPosition);
			if (pos.x <= imageX + img.width && pos.y <= imageY + img.height) {
				return true;
			}
		}
		return false;
	},

	// Remove a dynamic objebject from the world
	removeObject: function(o) {
		var i = rtge.state.objects.indexOf(o);
		if (i > -1) {
			rtge.state.objects.splice(i, 1);
		}
	},

	// A a dynamic object to the world
	addObject: function(o) {
		rtge.state.objects.push(o);
		rtge.state.objects.sort(function (a,b) {return a.z-b.z;});
	},

	// Return true if an interface element is at canvas position
	interfaceIsAt: function(o, pos) {
		var topLeft = rtge.interfaceElemPosition(o);
		var rightBottom = {
			x: topLeft.x + rtge.rpxToPx(o.width),
			y: topLeft.y + rtge.rpxToPx(o.height)
		};

		return (pos.x >= topLeft.x && pos.x <= rightBottom.x && pos.y >= topLeft.y && pos.y <= rightBottom.y);
	},

	// Return the interface element at canvas position pos, or null if there is none
	getInterfaceElem: function(pos) {
		// Search in reverse Z order to get the one drawn on top
		for (var i = rtge.graphicInterface.length - 1; i >= 0; --i) {
			for (var j = 0; j < rtge.graphicInterface[i].length; ++j) {
				var o = rtge.graphicInterface[i][j];
				if (rtge.interfaceIsAt(o, pos)) {
					return o;
				}
			}
		}
		return null;
	},
	
	canvasActivate: function(pos) {
		var i, o;

		// Check if we clicked an interface element, in reverse Z order to get the one drawn on top
		o = rtge.getInterfaceElem(pos);
		if (o != null) {
			if (o.click != null) {
				var elemPos = rtge.interfaceElemPosition(o);
				o.click(rtge.pxToRpx(pos.x - elemPos.x), rtge.pxToRpx(pos.y, elemPos.y));
			}
			return;
		}

		// Check if we clicked an object, in reverse order to get the one drawn on top
		pos = rtge.canvasPosToWorldPos(pos);
		for (i = rtge.state.objects.length - 1; i >= 0; --i) {
			o = rtge.state.objects[i];
			if (o.visible && rtge.objectIsAt(o, pos)) {
				if (o.click != null) {
					o.click();
					return;
				}
			}
		}

		// We didn't click an object, callback for clicking the world
		if (rtge.worldClick != null) {
			rtge.worldClick(pos.x, pos.y);
		}
	},
	
	canvasBeginInteraction: function(pos) {
		// Prepare to trigger a click event
		rtge.canClick = true;

		// Change state of the interface element at cursor pos
		var o = rtge.getInterfaceElem(pos);
		if (o != null) {
			o.state = 'click';
			return;
		}

		// Callbacks (worldMouseDown)
		if (rtge.camera.worldMouseDown != null) {
			rtge.camera.worldMouseDown(pos);
		}
	},
	
	canvasEndInteraction: function (pos) {
		// Process click event
		if (rtge.canClick) {
			rtge.canvasActivate(pos);
			rtge.canClick = false;
		}

		// Callbacks
		if (rtge.camera.mouseUp != null) {
			rtge.camera.mouseUp(pos);
		}

		// Release clicked interface elements
		for (var i = 0; i < rtge.graphicInterface.length; ++i) {
			for (var j = 0; j < rtge.graphicInterface[i].length; ++j) {
				var o = rtge.graphicInterface[i][j];
				if (o.state == 'click') {
					o.state = 'rest';
					return; // Only one element can be clicked at any time
				}
			}
		}
	},
	
	canvasMoveInteraction: function(pos) {
		// Moving forbids clicking
		rtge.canClick = false;

		// Inform dynamic objects
		var world_pos = rtge.canvasPosToWorldPos(pos);
		for (i = rtge.state.objects.length - 1; i >= 0; --i) {
			var o = rtge.state.objects[i];
			if (o.visible) {
				var o_is_under_cursor = rtge.objectIsAt(o, world_pos);
				if (o.mouseOver != null && o_is_under_cursor) {
					o.mouseOver(world_pos);
				}else if (o.mouseNotOver != null && !o_is_under_cursor) {
					o.mouseNotOver(world_pos);
				}
			}
		}

		// Update interface elements state
		for (var i = 0; i < rtge.graphicInterface.length; ++i) {
			for (var j = 0; j < rtge.graphicInterface[i].length; ++j) {
				var o = rtge.graphicInterface[i][j];
				var isUnderCursor = rtge.interfaceIsAt(o, pos);
				if (!isUnderCursor && o.state == 'over') {
					o.state = 'rest';
				}else if (isUnderCursor && o.state == 'rest') {
					o.state = 'over';
				}
			}
		}

		// Callbacks
		if (rtge.camera.mouseMove != null) {
			rtge.camera.mouseMove(pos);
		}
	},

	canvasMouseDown: function(evt) {
		var pos = rtge.getCanvasPos({x:evt.clientX, y:evt.clientY});
		rtge.canvasBeginInteraction(pos);
	},

	canvasMouseUp: function(evt) {
		var pos = rtge.getCanvasPos({x:evt.clientX, y:evt.clientY});
		rtge.canvasEndInteraction(pos);
	},

	canvasMouseMove: function(evt) {
		var pos = rtge.getCanvasPos({x:evt.clientX, y:evt.clientY});
		rtge.canvasMoveInteraction(pos);
	},
	
	canvasTouchStart: function(evt) {
		evt.preventDefault();
		if (rtge.currentTouch == null) {
			var touch = evt.changedTouches[0];
			rtge.currentTouch = touch.identifier;

			var pos = rtge.getCanvasPos({
				x: touch.clientX,
				y: touch.clientY
			});
			rtge.canvasBeginInteraction(pos);
		}
	},
	
	searchCurrentTouch: function(evt) {
		var touch = null;
		for (var i = 0; i < evt.changedTouches.length; ++i) {
			if (evt.changedTouches[i].identifier == rtge.currentTouch) {
				touch = evt.changedTouches[i];
				break;
			}
		}
		return touch;
	},
	
	canvasTouchEnd: function(evt) {
		evt.preventDefault();
		if (rtge.currentTouch != null) {
			var touch = rtge.searchCurrentTouch(evt);
			if (touch != null) {
				rtge.currentTouch = null;
				var pos = rtge.getCanvasPos({
					x: touch.clientX,
					y: touch.clientY
				});
				rtge.canvasEndInteraction(pos);
			}
		}
	},
	
	canvasTouchMove: function(evt) {
		evt.preventDefault();
		if (rtge.currentTouch != null) {
			var touch = rtge.searchCurrentTouch(evt);
			if (touch != null) {
				var pos = rtge.getCanvasPos({
					x: touch.clientX,
					y: touch.clientY
				});
				rtge.canvasMoveInteraction(pos);
			}
		}
	},
	
	canvasResize: function(evt) {
		/*var style = getComputedStyle(rtge.canvas);
		rtge.canvas.width = 1860; //style.width.slice(0, style.width.length - 2);
		rtge.canvas.height = 1080; //style.height.slice(0, style.height.length - 2);*/
	},

	getAnimationImage: function(animation, currentDuration) {
		// Get the animation object
		var anim = rtge.animations[animation];

		// Compute animation total duration
		var animationLength = 0;
		var i;
		for (i = 0; i < anim.durations.length; ++i) {
			animationLength += anim.durations[i];
		}

		// Get the url of the current image
		var url = anim.steps[0];
		var dur = currentDuration % animationLength;
		var pos = 0;
		for (i = 0; i < anim.durations.length; ++i) {
			pos += anim.durations[i];
			if (pos >= dur) {
				url = anim.steps[i];
				break;
			}
		}

		// Return the image
		return rtge.getImage(url);
	},

	getImage: function(imageUrl) {
		if (! rtge.isDirectlyDrawable(rtge.images[imageUrl])) {
			if (rtge.images[imageUrl].type == 'tilemap') {
				rtge.images[imageUrl] = rtge.tilemapToDrawable(rtge.images[imageUrl]);
			}else if (rtge.images[imageUrl].type == 'composite') {
				rtge.images[imageUrl] = rtge.compositeToDrawable(rtge.images[imageUrl]);
			}
		}
		return rtge.images[imageUrl];
	},

	drawImage: function(imageUrl, x, y) {
		if (
			rtge.isDirectlyDrawable(rtge.images[imageUrl]) ||
			rtge.prerenderTilemaps
		)
		{
			rtge.canvasCtx.drawImage(rtge.getImage(imageUrl), x, y);
		}else if (rtge.images[imageUrl].type == 'tilemap') {
			rtge.drawTilemap(
				rtge.canvasCtx, rtge.images[imageUrl],
				x, y, rtge.canvas.width, rtge.canvas.height
			);
		}else if (rtge.images[imageUrl].type == 'composite') {
			rtge.drawComposite(rtge.canvasCtx, rtge.images[imageUrl], x, y);
		}
	},

	isDirectlyDrawable: function(o) {
		return (
			o instanceof Image ||
			o instanceof HTMLCanvasElement
		);
	},

	tilemapToDrawable: function(tilemap) {
		var canvas = document.createElement('canvas');
		canvas.width = tilemap.tilemap.width * tilemap.tilemap.tilewidth;
		canvas.height = tilemap.tilemap.height * tilemap.tilemap.tileheight;
		var ctx = canvas.getContext('2d');

		rtge.drawTilemap(ctx, tilemap, 0, 0, canvas.width, canvas.height);
		return canvas;
	},

	drawTilemap: function(ctx, tilemap, renderX, renderY, width, height) {
		tilemap = tilemap.tilemap;

		var firstX = Math.max(0, Math.floor(-renderX / 16));
		var firstY = Math.max(0, Math.floor(-renderY / 16));
		var lastX = Math.min(tilemap.width, Math.ceil((-renderX + width) / 16));
		var lastY = Math.min(tilemap.height, Math.ceil((-renderY + height) / 16));

		for (var layerIndex = 0; layerIndex < tilemap.layers.length; ++ layerIndex) {
			var layer = tilemap.layers[layerIndex];
			if (layer.visible) {
				var x, y;
				for (y = firstY; y < lastY; ++y) {
					for (x = firstX; x < lastX; ++x) {
						var tileIndex = layer.data[x + y * tilemap.width];
						if (tileIndex == 0) {
							continue;
						}

						for (var tilesetIndex = 0; tilesetIndex < tilemap.tilesets.length; ++ tilesetIndex) {
							var tileset = tilemap.tilesets[tilesetIndex];
							if (tileIndex >= tileset.firstgid && tileIndex < tileset.firstgid + tileset.tilecount) {
								var relativeIndex = tileIndex - tileset.firstgid;
								var pixelIndex = relativeIndex * tileset.tilewidth;
								var sourceX = pixelIndex % tileset.imagewidth;
								var sourceY = Math.floor(pixelIndex / tileset.imagewidth) * tileset.tileheight;
								var destX = Math.floor(renderX) + x * tilemap.tilewidth;
								var destY = Math.floor(renderY) + y * tilemap.tileheight;
								ctx.drawImage(
									rtge.getImage(tileset.image),
									sourceX, sourceY, tileset.tilewidth, tileset.tileheight,
									destX, destY, tilemap.tilewidth, tilemap.tileheight
								);
								break;
							}
						}
					}
				}
			}
		}
	},

	compositeToDrawable: function(composite) {
		var canvas = document.createElement('canvas');
		canvas.width = composite.width;
		canvas.height = composite.height;
		var ctx = canvas.getContext('2d');

		rtge.drawComposite(ctx, composite, 0, 0);
		return canvas;
	},

	drawComposite: function(ctx, composite, renderX, renderY) {
		for (var componentIndex = 0; componentIndex < composite.components.length; ++componentIndex) {
			var component = composite.components[componentIndex];
			ctx.drawImage(
				rtge.getImage(component),
				0, 0, composite.width, composite.height,
				renderX, renderY, composite.width, composite.height
			);
		}
	},

	// Current game state
	state: {
		terrain: null,
		objects: [
		]
	},
	
	// Tracking of interesting touch event
	currentTouch: null,

	// Function called when the user click on the world,
	// takes two number as parameters (x and y positions)
	worldClick: null,

	// Function called before updating the state
	// takes one number as parameter (the number of milliseconds since the last tick)
	globalTick: null,

	// Function called after all rendering
	// takes no parameter
	postRender: null,

	// True when the next mouseUp event is a click
	canClick: false,

	// Camera
	camera: {
		x: 0,
		y: 0
	},

	// Images data
	images: {
		//'url': Image(),
	},

	// Animation data
	animations: {
		//'animation name': Animation(),
	},

	// Graphical User interface
	graphicInterface: [
		//[ InterfaceElement(), ... ], ...
	],

	// Set to true to render tilemaps only once
	//  * inconvenient to modify tilemaps on the fly
	//  * memory usage increase
	//  * big speed improvement when lots of cells on screen
	prerenderTilemaps: true,
};

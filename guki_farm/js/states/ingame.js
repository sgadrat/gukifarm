var InGame = {
	getGraphics: function() {
		var graphics = [
			'img/action_circle.png',
			'img/bg.png',
			'img/hen_dead.png',
			'img/loot_fun.png',
			'img/loot_hen.png',
			'img/loot_hygiene.png',
			'img/loot_love.png',
			'img/lower_fence.png',
			'img/treasure.png',
			'img/treasure_open.png',
		];

		for (var frame_num = 0; frame_num < 9; ++frame_num) {
			if (frame_num < 9) {
				graphics.push('img/hen/walking/bot/frame_' + frame_num + '.png');
				graphics.push('img/hen/walking/top/frame_' + frame_num + '.png');
				graphics.push('img/hen/eating/frame_' + frame_num + '.png');
			}
			if (frame_num < 8) {
				graphics.push('img/hen/walking/right/frame_' + frame_num + '.png');
				graphics.push('img/hen/walking/left/frame_' + frame_num + '.png');
				graphics.push('img/hen/poping/frame_' + frame_num + '.png');
				graphics.push('img/hen/loving/frame_' + frame_num + '.png');
			}
			if (frame_num < 4) {
				graphics.push('img/hen/cleaning/frame_' + frame_num + '.png');
				graphics.push('img/hen/playing/frame_' + frame_num + '.png');
			}
		}

		var needs = ['food', 'hygiene', 'fun', 'love'];
		for (var need_idx = 0; need_idx < needs.length; ++need_idx) {
			graphics.push('img/need_icons_'+ needs[need_idx] +'.png');
		}

		var actions = ['feed', 'wash', 'play', 'hug'];
		for (var action_idx = 0; action_idx < actions.length; ++action_idx) {
			graphics.push('img/action_btn_'+ actions[action_idx] +'.png');
		}

		return graphics;
	},

	getAnimations: function() {
		var animations = {};

		var actions = ['feed', 'wash', 'play', 'hug'];
		for (var action_idx = 0; action_idx < actions.length; ++action_idx) {
			var action_name = actions[action_idx];
			var action_btn = new rtge.Animation();
			action_btn.steps = ['img/action_btn_'+ action_name +'.png'];
			action_btn.durations = [600000];
			animations['ingame.action.btns.'+ action_name] = action_btn;
		}

		var action_circle = new rtge.Animation();
		action_circle.steps = ['img/action_circle.png'];
		action_circle.durations = [600000];
		animations['ingame.action.circle'] = action_circle;

		var gui_treasure = new rtge.Animation();
		gui_treasure.steps = ['img/treasure.png'];
		gui_treasure.durations = [600000];
		animations['ingame.gui.treasure.closed'] = gui_treasure;

		var gui_treasure_open = new rtge.Animation();
		gui_treasure_open.steps = ['img/treasure_open.png'];
		gui_treasure_open.durations = [600000];
		animations['ingame.gui.treasure.open'] = gui_treasure_open;

		var loot_types = ['hen', 'love', 'hygiene', 'fun'];
		for (var loot_idx = 0; loot_idx < loot_types.length; ++loot_idx) {
			var loot_type = loot_types[loot_idx];
			var loot_anim = new rtge.Animation();
			loot_anim.steps = ['img/loot_'+loot_type+'.png'];
			loot_anim.durations = [600000];
			animations['ingame.loot.'+loot_type] = loot_anim;
		}

		var lower_fence = new rtge.Animation();
		lower_fence.steps = ['img/lower_fence.png'];
		lower_fence.durations = [600000];
		animations['ingame.environment.lower_fence'] = lower_fence;

		var hen_dead = new rtge.Animation();
		hen_dead.steps = ['img/hen_dead.png'];
		hen_dead.durations = [600000];
		animations['ingame.hen.dead'] = hen_dead;

		var hen_emotes = [
			{name:'cleaning', size: 6, rate:160, mod: 3},
			{name:'eating', size:9, rate:40*6, mod: 1000},
			{name:'loving', size:8, rate:160, mod: 1000},
			{name:'playing', size:4, rate:160, mod: 1000},
			{name:'poping', size:8, rate:160, mod: 1000},
		];
		for (var emote_idx = 0; emote_idx < hen_emotes.length; ++emote_idx) {
			var emote = hen_emotes[emote_idx];
			var anim = new rtge.Animation();
			for (var frame_num = 0; frame_num < emote.size; ++frame_num) {
				anim.steps.push('img/hen/'+ emote.name +'/frame_'+ (frame_num >= emote.mod ? emote.mod - (frame_num % emote.mod) : frame_num) +'.png');
				anim.durations.push(emote.rate);
			}
			animations['ingame.hen.'+ emote.name] = anim;
		}

		var needs = ['food', 'hygiene', 'fun', 'love'];
		for (var need_idx = 0; need_idx < needs.length; ++need_idx) {
			var need_name = needs[need_idx];

			var need_icon_anim = new rtge.Animation();
			need_icon_anim.steps = ['img/need_icons_'+ need_name +'.png'];
			need_icon_anim.durations = [600000];
			animations['ingame.need_icons.'+ need_name] = need_icon_anim;
		}

		var directions = ['top', 'bot'];
		for (var direction_idx = 0; direction_idx < directions.length; ++direction_idx) {
			var direction = directions[direction_idx];
			var anim = new rtge.Animation();
			for (var frame_num = 0; frame_num < 9; ++frame_num) {
				var img_path = 'img/hen/walking/'+ direction +'/frame_'+ frame_num +'.png';
				anim.steps.push(img_path);
				anim.durations.push(40*6);
			}
			animations['ingame.hen.walking.'+ direction] = anim;
		}

		directions = ['left', 'right'];
		for (var direction_idx = 0; direction_idx < directions.length; ++direction_idx) {
			var direction = directions[direction_idx];
			var anim = new rtge.Animation();
			for (var frame_num = 0; frame_num < 8; ++frame_num) {
				var img_path = 'img/hen/walking/'+ direction +'/frame_'+ frame_num +'.png';
				anim.steps.push(img_path);
			}
			anim.durations = [4*40, 5*40, 5*40, 8*40, 8*40, 4*40, 4*40];
			animations['ingame.hen.walking.'+direction] = anim;
		}

		return animations;
	},

	State: function() {
		// Data
		this.action_circle = null;
		this.focused_hen = null;
		this.treasures = [];
		this.treasure_cooldown = 5000;
		this.possible_loot = [
			{
				max_range: 100,
				name: 'love',
				animation: 'ingame.loot.love',
				process: function(scene) {
					// Activate love need
					if (scene.activeNeeds.indexOf('love') == -1) {
						scene.addNeed('love');
					}

					// Never re-loot this item
					for (var loot_idx = 0; loot_idx < scene.possible_loot.length; ++loot_idx) {
						if (scene.possible_loot[loot_idx].name == 'love') {
							scene.possible_loot.splice(loot_idx, 1);
							break;
						}
					}
				},
			},
			{
				max_range: 100,
				name: 'fun',
				animation: 'ingame.loot.fun',
				process: function(scene) {
					// Activate love need
					if (scene.activeNeeds.indexOf('fun') == -1) {
						scene.addNeed('fun');
					}

					// Never re-loot this item
					for (var loot_idx = 0; loot_idx < scene.possible_loot.length; ++loot_idx) {
						if (scene.possible_loot[loot_idx].name == 'fun') {
							scene.possible_loot.splice(loot_idx, 1);
							break;
						}
					}
				},
			},
			{
				max_range: 100,
				name: 'hygiene',
				animation: 'ingame.loot.hygiene',
				process: function(scene) {
					// Activate love need
					if (scene.activeNeeds.indexOf('hygiene') == -1) {
						scene.addNeed('hygiene');
					}

					// Never re-loot this item
					for (var loot_idx = 0; loot_idx < scene.possible_loot.length; ++loot_idx) {
						if (scene.possible_loot[loot_idx].name == 'hygiene') {
							scene.possible_loot.splice(loot_idx, 1);
							break;
						}
					}
				},
			},
			{
				max_range: 100,
				name: 'hen',
				animation: 'ingame.loot.hen',
				process: function(scene) {
					rtge.addObject(new InGame.Hen(scene));
				},
			},
		];
		this.activeNeeds = ['food'];

		// Methods
		this.tick = function(timeElapsed) {
			this.treasure_cooldown -= timeElapsed;
			if (this.treasure_cooldown <= 0) {
				this.placeTreasure();
				this.treasure_cooldown = 4000 + Math.random() * 2000;
			}
		};

		this.addNeed = function(needName) {
			this.activeNeeds.push(needName);
		};

		this.placeTreasure = function() {
			if (this.treasures.length < 100) {
				var treasure = new InGame.Treasure(this, 1860/2 - 200/2, 1080/2 - 200/2);
				rtge.addObject(treasure);
				this.treasures.push(treasure);
				this.repositionTreasures();
			}
		};

		this.openTreasure = function(treasure) {
			for (var treasure_idx = 0; treasure_idx < this.treasures.length; ++treasure_idx) {
				if (this.treasures[treasure_idx] === treasure) {
					var dice = Math.random() * 100;
					var loot = null;
					for (var loot_idx = 0; loot_idx < this.possible_loot.length; ++loot_idx) {
						loot = this.possible_loot[loot_idx];
						if (dice <= loot.max_range) {
							break;
						}
					}

					rtge.addObject(new InGame.LootMessage(this, treasure_idx, loot.animation, loot.process));
					treasure.animation = 'ingame.gui.treasure.open';
					treasure.anchorX = 0;
					treasure.anchorY = 0;

					document.getElementById('loot_box_open').play();

					break;
				}
			}
		};

		this.repositionTreasures = function() {
			for (var treasure_idx = 0; treasure_idx < this.treasures.length; ++treasure_idx) {
				this.treasures[treasure_idx].goTo({x: (treasure_idx % 9) * 200, y: 870 - (Math.floor(treasure_idx / 9) * 210)});
			}
		};

		this.worldClick = function(x, y) {
			this.removeActionCircle();
		};

		this.placeActionCircle = function(hen) {
			if (this.action_circle != null) {
				this.removeActionCircle();
			}
			this.action_circle = new InGame.ActionCircle(hen);
			rtge.addObject(this.action_circle);
			for (var btn_idx = 0; btn_idx < this.action_circle.btns.length; ++btn_idx) {
				rtge.addObject(this.action_circle.btns[btn_idx]);
			}
			this.focused_hen = hen;

			document.getElementById('menu_open').play();
		};

		this.removeActionCircle = function() {
			if (this.action_circle == null) {
				return;
			}

			rtge.removeObject(this.action_circle);
			for (var btn_idx = 0; btn_idx < this.action_circle.btns.length; ++btn_idx) {
				rtge.removeObject(this.action_circle.btns[btn_idx]);
			}

			if (this.focused_hen != null) {
				this.focused_hen.hideNeeds();
			}
			this.action_circle = null;
			this.focused_hen = null;
		};

		this.actionClean = function() {
			if (this.focused_hen == null) {
				return;
			}

			this.focused_hen.startCleaning();
			this.removeActionCircle();
		}

		this.actionFeed = function() {
			if (this.focused_hen == null) {
				return;
			}

			this.focused_hen.startEating();
			this.removeActionCircle();
		};

		this.actionFun = function() {
			if (this.focused_hen == null) {
				return;
			}

			this.focused_hen.startPlaying();
			this.removeActionCircle();
		};

		this.actionHug = function() {
			if (this.focused_hen == null) {
				return;
			}

			this.focused_hen.startLoving();
			this.removeActionCircle();
		};

		// Initialization logic
		rtge.state.terrain = 'img/bg.png';
		var lower_fence = new rtge.DynObject();
		lower_fence.animation = 'ingame.environment.lower_fence';
		lower_fence.z = 99;
		rtge.addObject(lower_fence);
		for (var i = 0; i < 3; ++i) {
			rtge.addObject(new InGame.Hen(this));
		}
	},

	Hen: function(scene) {
		// Data
		rtge.DynObject.call(this);
		this.x = 528 + Math.random() * 798;
		this.y = 398 + Math.random() * 366;
		this.anchorX = 50;
		this.anchorY = 90;
		this.animation = 'ingame.hen.walking.right';

		this.direction = {x: 1, y: 0};
		this.speed = 0.1;
		this.needs = {
			'food': {value: 0, speed: .1},
			'love': {value: 0, speed: .05},
			'hygiene': {value: 0, speed: .01},
			'fun': {value: 0, speed: .04},
		};
		this.needIcons = {
			'food': new InGame.NeedIcon(this, 'ingame.need_icons.food', 'food', -15, -40-15),
			'love': new InGame.NeedIcon(this, 'ingame.need_icons.love', 'love', 15, -40-15),
			'hygiene': new InGame.NeedIcon(this, 'ingame.need_icons.hygiene', 'hygiene', -15, -40+15),
			'fun': new InGame.NeedIcon(this, 'ingame.need_icons.fun', 'fun', 15, -40+15),
		};
		this.needIconsAppearing = false;
		this.scene = scene;
		this.state = null;

		// Methods
		this.tick = function(timeElapsed) {
			// Move the Hen
			switch (this.state.name) {
				case 'walking':
					this.state.direction_change_cd = Math.max(0, this.state.direction_change_cd - timeElapsed);
					this.updateDirection();
					this.x += this.direction.x * this.speed * timeElapsed;
					this.y += this.direction.y * this.speed * timeElapsed;
					break;
				case 'emote':
					this.state.counter -= timeElapsed;
					if (this.state.counter <= 0) {
						this.startWalking();
					}
					break;
			};

			// Handle needs
			for (need_name in this.needs) {
				if (this.scene.activeNeeds.indexOf(need_name) > -1) {
					var need = this.needs[need_name];
					need.value += need.speed;
					if (need.value >= 100) {
						this.die();
						return;
					}
				}
			}
			if (this.preemptiveNeeds()) {
				this.showNeeds();
			}
		};

		this.preemptiveNeeds = function() {
			if (this.scene.focused_hen === this) {
				return true;
			}

			for (var need_name in this.needs) {
				if (this.needs[need_name].value >= 75) {
					return true;
				}
			}

			return false;
		};

		this.click = function() {
			this.scene.placeActionCircle(this);
			this.showNeeds();
		};

		this.mouseOver = function(mouse_pos) {
			this.showNeeds();
		};

		this.mouseNotOver = function(mouse_pos) {
			if (! this.preemptiveNeeds()) {
				this.hideNeeds();
			}
		};

		this.showNeeds = function() {
			if (this.needIconsAppearing) {
				return;
			}
			this.needIconsAppearing = true;

			for (var need_name in this.needIcons) {
				if (this.scene.activeNeeds.indexOf(need_name) > -1) {
					rtge.addObject(this.needIcons[need_name]);
				}
			}
		};

		this.hideNeeds = function() {
			if (! this.needIconsAppearing) {
				return;
			}
			this.needIconsAppearing = false;

			for (var need_name in this.needIcons) {
				rtge.removeObject(this.needIcons[need_name]);
			}
		};

		this.startWalking = function() {
			this.state = {name: 'walking', direction_change_cd: 0};
			this.updateWalkingAnimation();
		};

		this.startEating = function() {
			this.state = {name: 'emote', counter: 2160};
			this.animation = 'ingame.hen.eating';
			this.animationPosition = 0;
			this.needs['food'].value = 0;
		};

		this.startLoving = function() {
			this.state = {name: 'emote', counter: 1280};
			this.animation = 'ingame.hen.loving';
			this.animationPosition = 0;
			this.needs['love'].value = 0;
		};

		this.startPlaying = function() {
			this.state = {name: 'emote', counter: 1280};
			this.animation = 'ingame.hen.playing';
			this.animationPosition = 0;
			this.needs['fun'].value = 0;
		};

		this.startPoping = function() {
			this.state = {name: 'emote', counter: 160*8};
			this.animation = 'ingame.hen.poping';
			this.animationPosition = 0;
		};

		this.startCleaning = function() {
			this.state = {name: 'emote', counter: 1000};
			this.animation = 'ingame.hen.cleaning';
			this.animationPosition = 0;
			this.needs['hygiene'].value = 0;
		};

		this.die = function() {
			if (this.scene.focused_hen === this) {
				this.scene.removeActionCircle();
			}

			this.hideNeeds();
			rtge.removeObject(this);
			rtge.addObject(new InGame.DeadHen(this));
		};

		this.updateDirection = function() {
			var momentum = this.direction;
			var random = this.getRandomDirection();
			var flee_fence = this.getFleeFenceDirection();

			this.direction = Utils.normalize({
				x: momentum.x*1 + random.x*0.2 + flee_fence.x*1,
				y: momentum.y*1 + random.y*0.2 + flee_fence.y*1
			});

			this.updateWalkingAnimation();
		};

		this.updateWalkingAnimation = function() {
			if (this.state.name == 'walking' && this.state.direction_change_cd <= 0) {
				this.state.direction_change_cd = 100;

				var direction_name = null;
				if (Math.abs(this.direction.x) > Math.abs(this.direction.y)) {
					direction_name = (this.direction.x < 0 ? 'left' : 'right');
				}else {
					direction_name = (this.direction.y < 0 ? 'top' : 'bot');
				}
				var animation_name = 'ingame.hen.walking.'+direction_name;
				if (animation_name != this.animation) {
					this.animation = animation_name;
					this.animationPosition = 0;
				}
			}
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
			var fence_nw = {a: .58, b: 1, c: -670};
			var fence_ne = {a: -.58, b: 1, c: 399};
			var fence_se = {a: .58, b: 1, c: -1569};
			var fence_sw = {a: -.58, b: 1, c: -496};

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

		// Initialization logic
		this.startPoping();
	},

	DeadHen: function(hen) {
		rtge.DynObject.call(this);
		this.x = hen.x;
		this.y = hen.y;
		this.anchorX = 57;
		this.anchorY = 91;
		this.animation = 'ingame.hen.dead';

		this.speed = 0.25;

		this.tick = function(timeElapsed) {
			this.y -= this.speed * timeElapsed;
			if (this.y < -10) {
				rtge.removeObject(this);
			}
		};
	},

	NeedIcon: function(hen, animation, need_name, x, y) {
		rtge.DynObject.call(this);
		this.x = hen.x + x;
		this.y = hen.y + y;
		this.z = 100;
		this.anchorX = 15;
		this.anchorY = 15;
		this.animation = animation;

		this.hen = hen;
		this.need_name = need_name;
		this.offset_x = x;
		this.offset_y = y;

		this.tick = function(timeElapsed) {
			this.x = this.hen.x + this.offset_x;
			this.y = this.hen.y + this.offset_y;
		};

		this.preDraw = function() {
			var red = 255;
			var blue = 255;
			var factor;
			var need_value = this.hen.needs[this.need_name].value;
			if (need_value <= 50) {
				factor = need_value / 50.;
				red *= factor;
			}else {
				factor = 1 - (need_value - 50.) / 50.;
				blue *= factor;
			}
			rtge.canvasCtx.fillStyle = 'rgb('+Math.floor(red)+','+Math.floor(blue)+',0)';
			rtge.canvasCtx.fillRect(this.x - this.anchorX, this.y - this.anchorY, 30, 30);
		};
	},

	ActionCircle: function(hen) {
		rtge.DynObject.call(this);
		this.x = hen.x;
		this.y = hen.y - 40;
		this.z = 101;
		this.anchorX = 175;
		this.anchorY = 175;
		this.animation = 'ingame.action.circle';

		this.hen = hen;
		var scene = this.hen.scene;

		this.btns = [];
		if (scene.activeNeeds.indexOf('food') > -1) {
			this.btns.push(new InGame.ActionBtn(this, 0, -122, 'ingame.action.btns.feed', function() {scene.actionFeed();}));
		}
		if (scene.activeNeeds.indexOf('love') > -1) {
			this.btns.push(new InGame.ActionBtn(this, 122, 0, 'ingame.action.btns.hug', function() {scene.actionHug();}));
		}
		if (scene.activeNeeds.indexOf('hygiene') > -1) {
			this.btns.push(new InGame.ActionBtn(this, 0, 122, 'ingame.action.btns.wash', function() {scene.actionClean();}));
		}
		if (scene.activeNeeds.indexOf('fun') > -1) {
			this.btns.push(new InGame.ActionBtn(this, -122, 0, 'ingame.action.btns.play', function() {scene.actionFun();}));
		}

		this.tick = function(timeElapsed) {
			this.x = hen.x;
			this.y = hen.y - 40;
		};
	},

	ActionBtn: function(action_circle, x, y, animation, callback) {
		rtge.DynObject.call(this);
		this.x = action_circle.x + x;
		this.y = action_circle.y + y;
		this.z = 102;
		this.anchorX = 58;
		this.anchorY = 58;
		this.animation = animation;

		this.offset_x = x;
		this.offset_y = y;
		this.callback = callback;

		this.tick = function(timeElapsed) {
			this.x = action_circle.x + this.offset_x;
			this.y = action_circle.y + this.offset_y;
		};

		this.click = function() {
			this.callback();
			document.getElementById('btn_click').play();
		};
	},

	Treasure: function(scene, x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 200;
		this.anchorX = -59;
		this.anchorY = -36;
		this.animation = 'ingame.gui.treasure.closed';

		this.destination = null;
		this.speed = 2;
		this.scene = scene;

		this.click = function() {
			if (this.destination == null) {
				this.scene.openTreasure(this);
			}
		};

		this.tick = function(timeElapsed) {
			if (this.destination != null) {
				var trip = {
					x: this.destination.x - this.x,
					y: this.destination.y - this.y
				};
				var direction = Utils.normalize(trip);
				var movement = {
					x: direction.x * this.speed * timeElapsed,
					y: direction.y * this.speed * timeElapsed
				};

				if (Math.abs(movement.x) <= Math.abs(trip.x)) {
					this.x += movement.x;
				}else {
					this.x = this.destination.x;
				}
				if (Math.abs(movement.y) <= Math.abs(trip.y)) {
					this.y += movement.y;
				}else {
					this.y = this.destination.y;
				}

				if (this.x == this.destination.x && this.y == this.destination.y) {
					this.destination = null;
				}
			}
		};

		this.goTo = function(destination) {
			this.destination = destination;
		};
	},

	LootMessage: function(scene, treasure_idx, animation, callback) {
		rtge.DynObject.call(this);
		this.z = 1000;
		this.animation = animation;

		this.scene = scene;
		this.callback = callback;

		this.click = function() {
			rtge.removeObject(scene.treasures[treasure_idx]);
			scene.treasures.splice(treasure_idx, 1);
			scene.repositionTreasures();

			rtge.removeObject(this);

			this.callback(scene);
		};
	},
};

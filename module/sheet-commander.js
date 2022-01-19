const moduleId = "sheet-commander";
const localizationId = "SHEET-COMMANDER";

let lastSeenApp = null;

let metaKey = true;
let altKey = false;
let ctrlKey = false;
let shiftKey = false;

function startMonitoring(app, html) {
	html.on('mousemove', function (event) {
		let isAccepted = false;

		if ((metaKey && event.metaKey || (!metaKey && !event.metaKey)) &&
			(altKey && event.altKey || (!altKey && !event.altKey)) &&
			(ctrlKey && event.ctrlKey || (!ctrlKey && !event.ctrlKey)) &&
			(shiftKey && event.shiftKey || (!shiftKey && !event.shiftKey))) {
				isAccepted = true;
			}

		if (isAccepted && !this.isActive) {
			// Move start
			this.isActive = true;
			this.appStart = {
				left: app.position.left,
				top: app.position.top
			}
			this.mouseStart = {
				left: event.pageX,
				top: event.pageY
			}
		} else if (!isAccepted && this.isActive) {
			// Move end
			this.isActive = false;
		}

		if (this.isActive) {
			const left = this.appStart.left + event.pageX - this.mouseStart.left;
			const top = this.appStart.top + event.pageY - this.mouseStart.top;
			app.setPosition({ left, top });
		}
	}.bind({
		isActive: false
	}));

	html.on('mouseenter', function(event) {
		lastSeenApp = app;
	});
	html.on('mouseleave', function(event) {
		if (lastSeenApp === app) {
			lastSeenApp = null;
		}
	});
}

Hooks.on('renderFormApplication', (app, html) => {
	startMonitoring(app, html);
});
Hooks.on('renderActorSheet', (app, html) => {
	startMonitoring(app, html);
});
Hooks.on('renderItemSheet', (app, html) => {
	startMonitoring(app, html);
});
Hooks.on('renderJournalSheet', (app, html) => {
	startMonitoring(app, html);
});
Hooks.on('renderCompendium', (app, html) => {
	startMonitoring(app, html);
});
Hooks.on('renderSidebarTab', (app, html) => {
	if (app !== app._original) {
		startMonitoring(app, html);
	}
});

Hooks.once('setup', () => {
	game.keybindings.register(moduleId, 'keybinding-under-mouse', {
		name: `${localizationId}.close-under-mouse-hotkey`,
		editable: [],
		onDown: (ctx) => {
			lastSeenApp?.close();
		}
	});
	game.keybindings.register(moduleId, 'keybinding-active', {
		name: `${localizationId}.close-active-hotkey`,
		editable: [],
		onDown: (ctx) => {
			ui.activeWindow?.close();
		}
	});

	game.settings.register(moduleId, 'meta-move', {
		name: `${localizationId}.meta-move`,
		hint: `${localizationId}.move-hint`,
		scope: 'client',
		config: true,
		type: Boolean,
		default: true,
		onChange: value => { metaKey = value; }
	});
	game.settings.register(moduleId, 'alt-move', {
		name: `${localizationId}.alt-move`,
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		onChange: value => { altKey = value; }
	});
	game.settings.register(moduleId, 'ctrl-move', {
		name: `${localizationId}.ctrl-move`,
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		onChange: value => { ctrlKey = value; }
	});
	game.settings.register(moduleId, 'shift-move', {
		name: `${localizationId}.shift-move`,
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		onChange: value => { shiftKey = value; }
	});

	metaKey = game.settings.get(moduleId, 'meta-move');
	altKey = game.settings.get(moduleId, 'alt-move');
	ctrlKey = game.settings.get(moduleId, 'ctrl-move');
	shiftKey = game.settings.get(moduleId, 'shift-move');
});

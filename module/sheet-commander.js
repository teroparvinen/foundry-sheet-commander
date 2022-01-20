const moduleId = "sheet-commander";
const localizationId = "SHEET-COMMANDER";

let lastSeenApp = null;

let metaKey = true;
let altKey = false;
let ctrlKey = false;
let shiftKey = false;

let state = {
    trackingId: null
}

function startMonitoring(app, html) {
    html.on('mousemove', function (event) {
        let isAccepted = false;

        if ((metaKey && event.metaKey || (!metaKey && !event.metaKey)) &&
            (altKey && event.altKey || (!altKey && !event.altKey)) &&
            (ctrlKey && event.ctrlKey || (!ctrlKey && !event.ctrlKey)) &&
            (shiftKey && event.shiftKey || (!shiftKey && !event.shiftKey))) {
                isAccepted = true;
            }

        if (isAccepted && !state.trackingId) {
            // Move start
            state.trackingId = app.id;
            state.appStart = {
                left: app.position.left,
                top: app.position.top
            }
            state.mouseStart = {
                left: event.pageX,
                top: event.pageY
            }
        } else if (!isAccepted && state.trackingId) {
            // Move end
            state.trackingId = null;
        }

        if (state.trackingId == app.id) {
            const left = state.appStart.left + event.pageX - state.mouseStart.left;
            const top = state.appStart.top + event.pageY - state.mouseStart.top;
            app.setPosition({ left, top });
        }
    });

    html.on('mouseenter', function(event) {
        lastSeenApp = app;
    });
    html.on('mouseleave', function(event) {
        if (lastSeenApp === app) {
            lastSeenApp = null;
        }
    });
}

function stopMonitoring(app) {
    if (state.trackingId == app.id) {
        state.trackingId = null;
    }
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

Hooks.on('closeApplication', (app) => {
    stopMonitoring(app);
});
Hooks.on('closeActorSheet', (app) => {
    stopMonitoring(app);
});
Hooks.on('closeItemSheet', (app) => {
    stopMonitoring(app);
});
Hooks.on('closeSidebarTab', (app) => {
    stopMonitoring(app);
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
        default: false,
        onChange: value => { metaKey = value; }
    });
    game.settings.register(moduleId, 'alt-move', {
        name: `${localizationId}.alt-move`,
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
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

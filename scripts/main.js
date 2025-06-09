/**
 * Daggerheart PDF Sync Module
 * Main initialization and API
 */

import { DaggerheartSync } from './sync.js';
import { DaggerheartSyncUI } from './ui.js';

Hooks.once('init', () => {
  console.log('Daggerheart PDF Sync | Initializing module');
  
  // Register module settings
  game.settings.register('daggerheart-sync', 'autoSync', {
    name: 'DAGGERHEART_SYNC.Settings.AutoSync.Name',
    hint: 'DAGGERHEART_SYNC.Settings.AutoSync.Hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register('daggerheart-sync', 'syncInterval', {
    name: 'DAGGERHEART_SYNC.Settings.SyncInterval.Name',
    hint: 'DAGGERHEART_SYNC.Settings.SyncInterval.Hint',
    scope: 'world',
    config: true,
    type: Number,
    default: 300000, // 5 minutes
    range: {
      min: 60000,  // 1 minute
      max: 1800000, // 30 minutes
      step: 60000   // 1 minute steps
    }
  });

  game.settings.register('daggerheart-sync', 'debugMode', {
    name: 'DAGGERHEART_SYNC.Settings.DebugMode.Name',
    hint: 'DAGGERHEART_SYNC.Settings.DebugMode.Hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  // Register the module API
  game.modules.get('daggerheart-sync').api = {
    sync: DaggerheartSync,
    ui: DaggerheartSyncUI
  };
});

Hooks.once('ready', () => {
  console.log('Daggerheart PDF Sync | Module ready');
  
  // Check for PDF-Pager dependency
  if (!game.modules.get('pdf-pager')?.active) {
    ui.notifications.warn('Daggerheart PDF Sync requires the PDF-Pager module to be installed and active.');
    return;
  }

  // Initialize the sync system
  DaggerheartSync.initialize();
  
  // Setup UI components
  DaggerheartSyncUI.initialize();
  
  // Setup automatic syncing if enabled
  if (game.settings.get('daggerheart-sync', 'autoSync')) {
    DaggerheartSync.setupAutoSync();
  }
});

// Add controls to actor sheet headers
Hooks.on('getActorSheetHeaderButtons', (app, buttons) => {
  if (app.actor.type !== 'character') return;
  
  buttons.unshift({
    label: 'DAGGERHEART_SYNC.Buttons.Sync',
    class: 'daggerheart-sync',
    icon: 'fas fa-sync-alt',
    onclick: () => DaggerheartSync.syncActor(app.actor)
  });
  
  buttons.unshift({
    label: 'DAGGERHEART_SYNC.Buttons.ViewData',
    class: 'daggerheart-view-data',
    icon: 'fas fa-eye',
    onclick: () => DaggerheartSyncUI.showSyncedData(app.actor)
  });
});

// Auto-sync on actor sheet render if enabled
Hooks.on('renderActorSheet', (app, html, data) => {
  if (!game.settings.get('daggerheart-sync', 'autoSync')) return;
  if (app.actor.type !== 'character') return;
  
  // Only auto-sync if data is stale
  if (DaggerheartSync.needsRefresh(app.actor)) {
    DaggerheartSync.syncActor(app.actor, { silent: true });
  }
});

// Socket handling for multiplayer sync
Hooks.on('ready', () => {
  game.socket.on('module.daggerheart-sync', (data) => {
    if (data.type === 'syncUpdate' && data.actorId) {
      const actor = game.actors.get(data.actorId);
      if (actor) {
        // Refresh actor data for other players
        actor.render();
      }
    }
  });
});
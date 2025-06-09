/**
 * Daggerheart PDF Sync UI Components
 */

import { DaggerheartSync } from './sync.js';

export class DaggerheartSyncUI {
  
  /**
   * Initialize UI components
   */
  static initialize() {
    console.log('Daggerheart PDF Sync | UI system initialized');
  }

  /**
   * Show synced data dialog
   * @param {Actor} actor - The actor to display data for
   */
  static async showSyncedData(actor) {
    if (!actor) {
      ui.notifications.warn(game.i18n.localize('DAGGERHEART_SYNC.Warnings.NoActor'));
      return;
    }
    
    const data = DaggerheartSync.getSyncedData(actor);
    const status = DaggerheartSync.getSyncStatus(actor);
    
    if (!status.synced) {
      // Offer to sync first
      const shouldSync = await Dialog.confirm({
        title: game.i18n.localize('DAGGERHEART_SYNC.Dialog.NoData.Title'),
        content: game.i18n.localize('DAGGERHEART_SYNC.Dialog.NoData.Content'),
        yes: () => true,
        no: () => false
      });
      
      if (shouldSync) {
        await DaggerheartSync.syncActor(actor);
        return this.showSyncedData(actor); // Recursive call with fresh data
      } else {
        return;
      }
    }
    
    const lastSyncTime = status.lastSync ? status.lastSync.toLocaleString() : 'Never';
    const needsRefresh = status.needsRefresh;
    
    new foundry.applications.api.DialogV2({
      window: {
        title: game.i18n.format('DAGGERHEART_SYNC.Dialog.ViewData.Title', { name: actor.name }),
        width: 650,
        height: 750,
        resizable: true
      },
      content: this._generateSyncDataHTML(data, lastSyncTime, needsRefresh),
      buttons: [
        {
          action: "close",
          label: game.i18n.localize('DAGGERHEART_SYNC.Buttons.Close'),
          default: true
        },
        {
          action: "refresh",
          label: game.i18n.localize('DAGGERHEART_SYNC.Buttons.Refresh'),
          callback: async () => {
            await DaggerheartSync.syncActor(actor, { force: true });
            this.showSyncedData(actor);
          }
        },
        {
          action: "console",
          label: game.i18n.localize('DAGGERHEART_SYNC.Buttons.LogToConsole'),
          callback: () => {
            console.log(`Daggerheart PDF Sync | Complete data for ${actor.name}:`, data);
            ui.notifications.info(game.i18n.localize('DAGGERHEART_SYNC.Info.LoggedToConsole'));
          }
        },
        {
          action: "clear",
          label: game.i18n.localize('DAGGERHEART_SYNC.Buttons.ClearData'),
          callback: async () => {
            const confirmed = await Dialog.confirm({
              title: game.i18n.localize('DAGGERHEART_SYNC.Dialog.ClearData.Title'),
              content: game.i18n.localize('DAGGERHEART_SYNC.Dialog.ClearData.Content')
            });
            
            if (confirmed) {
              await DaggerheartSync.clearSyncedData(actor);
            }
          }
        }
      ]
    }).render({ force: true });
  }

  /**
   * Generate HTML for sync data display
   * @private
   */
  static _generateSyncDataHTML(data, lastSyncTime, needsRefresh) {
    const refreshIndicator = needsRefresh 
      ? `<span style="color: #e74c3c; font-weight: bold;">⚠️ ${game.i18n.localize('DAGGERHEART_SYNC.Status.NeedsRefresh')}</span>`
      : `<span style="color: #2ecc71; font-weight: bold;">✅ ${game.i18n.localize('DAGGERHEART_SYNC.Status.Fresh')}</span>`;

    return `
      <style>
        .dh-sync-container {
          font-family: 'Signika', sans-serif;
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          color: #ecf0f1;
          padding: 20px;
          border-radius: 12px;
          max-height: 650px;
          overflow-y: auto;
          border: 2px solid #34495e;
        }
        .dh-sync-header {
          text-align: center;
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(52, 73, 94, 0.3);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .dh-sync-section {
          margin-bottom: 20px;
          border: 1px solid #444;
          border-radius: 8px;
          padding: 15px;
          background: rgba(255,255,255,0.05);
        }
        .dh-sync-section h3 {
          margin: 0 0 12px 0;
          color: #f39c12;
          border-bottom: 2px solid #555;
          padding-bottom: 8px;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .dh-sync-item {
          margin: 8px 0;
          padding: 6px 0;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .dh-sync-item:last-child {
          border-bottom: none;
        }
        .dh-sync-key {
          color: #3498db;
          font-weight: bold;
          flex: 0 0 auto;
          margin-right: 15px;
        }
        .dh-sync-value {
          color: #2ecc71;
          flex: 1;
          text-align: right;
          word-break: break-word;
        }
        .dh-sync-empty {
          color: #95a5a6;
          font-style: italic;
        }
        .dh-sync-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .dh-weapon-feature {
          grid-column: 1 / -1;
          background: rgba(0,0,0,0.3);
          padding: 8px;
          border-radius: 4px;
          font-size: 13px;
          margin-top: 8px;
        }
      </style>
      
      <div class="dh-sync-container">
        <div class="dh-sync-header">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
            📊 ${game.i18n.localize('DAGGERHEART_SYNC.Labels.SyncedData')}
          </div>
          <div style="font-size: 14px; margin-bottom: 5px;">
            <strong>${game.i18n.localize('DAGGERHEART_SYNC.Labels.LastSync')}:</strong> ${lastSyncTime}
          </div>
          <div style="font-size: 14px;">
            <strong>${game.i18n.localize('DAGGERHEART_SYNC.Labels.Status')}:</strong> ${refreshIndicator}
          </div>
        </div>
        
        <div class="dh-sync-section">
          <h3>👤 ${game.i18n.localize('DAGGERHEART_SYNC.Sections.Character')}</h3>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Name')}:</span>
            <span class="dh-sync-value">${data.character?.name || '<span class="dh-sync-empty">N/A</span>'}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Ancestry')}:</span>
            <span class="dh-sync-value">${data.character?.ancestry || '<span class="dh-sync-empty">N/A</span>'}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Community')}:</span>
            <span class="dh-sync-value">${data.character?.community || '<span class="dh-sync-empty">N/A</span>'}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Class')}:</span>
            <span class="dh-sync-value">${data.character?.class || '<span class="dh-sync-empty">N/A</span>'}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Subclass')}:</span>
            <span class="dh-sync-value">${data.character?.subclass || '<span class="dh-sync-empty">N/A</span>'}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Level')}:</span>
            <span class="dh-sync-value">${data.character?.level || 1}</span>
          </div>
        </div>
        
        <div class="dh-sync-section">
          <h3>⚡ ${game.i18n.localize('DAGGERHEART_SYNC.Sections.Attributes')}</h3>
          <div class="dh-sync-grid">
            ${this._generateAttributeHTML('Agility', data.attributes?.agility)}
            ${this._generateAttributeHTML('Finesse', data.attributes?.finesse)}
            ${this._generateAttributeHTML('Instinct', data.attributes?.instinct)}
            ${this._generateAttributeHTML('Knowledge', data.attributes?.knowledge)}
            ${this._generateAttributeHTML('Presence', data.attributes?.presence)}
            ${this._generateAttributeHTML('Strength', data.attributes?.strength)}
          </div>
        </div>
        
        <div class="dh-sync-section">
          <h3>❤️ ${game.i18n.localize('DAGGERHEART_SYNC.Sections.Resources')}</h3>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.HitPoints')}:</span>
            <span class="dh-sync-value">${data.resources?.hitPoints?.current || 0} / ${data.resources?.hitPoints?.max || 0}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Stress')}:</span>
            <span class="dh-sync-value">${data.resources?.stress?.current || 0} / ${data.resources?.stress?.max || 0}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Hope')}:</span>
            <span class="dh-sync-value">${data.resources?.hope || 0}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Armor')}:</span>
            <span class="dh-sync-value">${data.resources?.armor || 0}</span>
          </div>
        </div>
        
        <div class="dh-sync-section">
          <h3>⚔️ ${game.i18n.localize('DAGGERHEART_SYNC.Sections.Weapons')}</h3>
          ${this._generateWeaponHTML('Primary', data.weapons?.primary)}
          ${this._generateWeaponHTML('Secondary', data.weapons?.secondary)}
        </div>
        
        <div class="dh-sync-section">
          <h3>🎯 ${game.i18n.localize('DAGGERHEART_SYNC.Sections.Other')}</h3>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.ProficiencyLevel')}:</span>
            <span class="dh-sync-value">${data.proficiency?.level || 1}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">${game.i18n.localize('DAGGERHEART_SYNC.Fields.Experience')}:</span>
            <span class="dh-sync-value">${data.experience?.current || 0} / ${data.experience?.total || 0}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for an attribute
   * @private
   */
  static _generateAttributeHTML(name, attribute) {
    if (!attribute) {
      return `
        <div class="dh-sync-item">
          <span class="dh-sync-key">${name}:</span>
          <span class="dh-sync-value dh-sync-empty">N/A</span>
        </div>
      `;
    }

    return `
      <div class="dh-sync-item">
        <span class="dh-sync-key">${name}:</span>
        <span class="dh-sync-value">${attribute.value || 0} (${attribute.modifier || '+0'})</span>
      </div>
    `;
  }

  /**
   * Generate HTML for a weapon
   * @private
   */
  static _generateWeaponHTML(type, weapon) {
    if (!weapon || !weapon.name) {
      return `
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px;">
          <div style="font-weight: bold; color: #e74c3c; margin-bottom: 5px;">${type} Weapon:</div>
          <div class="dh-sync-empty">No weapon configured</div>
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px;">
        <div style="font-weight: bold; color: #f39c12; margin-bottom: 8px;">${type} Weapon: ${weapon.name}</div>
        <div class="dh-sync-grid">
          <div class="dh-sync-item">
            <span class="dh-sync-key">Trait:</span>
            <span class="dh-sync-value">${weapon.trait || 'N/A'}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">Range:</span>
            <span class="dh-sync-value">${weapon.range || 'N/A'}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">Damage:</span>
            <span class="dh-sync-value">${weapon.damage || 'N/A'}</span>
          </div>
          <div class="dh-sync-item">
            <span class="dh-sync-key">Type:</span>
            <span class="dh-sync-value">${weapon.type || 'N/A'}</span>
          </div>
        </div>
        ${weapon.feature ? `<div class="dh-weapon-feature"><strong>Features:</strong> ${weapon.feature}</div>` : ''}
      </div>
    `;
  }

  /**
   * Show sync settings dialog
   */
  static async showSettings() {
    // This could be expanded to show a custom settings dialog
    // For now, direct users to the module settings
    ui.notifications.info(game.i18n.localize('DAGGERHEART_SYNC.Info.UseModuleSettings'));
  }
}
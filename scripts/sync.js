/**
 * Daggerheart PDF Sync Core Functionality
 */

export class DaggerheartSync {
  static MODULE_ID = 'daggerheart-sync';
  static FLAG_KEY = 'syncedData';

  /**
   * Initialize the sync system
   */
  static initialize() {
    console.log('Daggerheart PDF Sync | Sync system initialized');
  }

  /**
   * Setup automatic syncing hooks
   */
  static setupAutoSync() {
    const interval = game.settings.get(this.MODULE_ID, 'syncInterval');
    
    // Setup periodic auto-sync for active character
    setInterval(() => {
      const actor = game.user.character;
      if (actor && this.needsRefresh(actor)) {
        this.syncActor(actor, { silent: true });
      }
    }, interval);
  }

  /**
   * Sync a specific actor's PDF data
   * @param {Actor} actor - The actor to sync
   * @param {Object} options - Sync options
   * @param {boolean} options.silent - Don't show notifications
   * @param {boolean} options.force - Force sync even if data is fresh
   */
  static async syncActor(actor, options = {}) {
    const { silent = false, force = false } = options;

    if (!actor) {
      if (!silent) ui.notifications.warn(game.i18n.localize('DAGGERHEART_SYNC.Warnings.NoActor'));
      return null;
    }

    if (!ui.pdfpager) {
      if (!silent) ui.notifications.error(game.i18n.localize('DAGGERHEART_SYNC.Errors.NoPDFPager'));
      return null;
    }

    // Check if sync is needed
    if (!force && !this.needsRefresh(actor)) {
      if (!silent) ui.notifications.info(game.i18n.localize('DAGGERHEART_SYNC.Info.DataFresh'));
      return this.getSyncedData(actor);
    }

    try {
      const pdfData = await this._extractPDFData(actor);
      
      // Save to actor flags with proper module scope
      await actor.setFlag(this.MODULE_ID, this.FLAG_KEY, pdfData);
      
      if (!silent) {
        ui.notifications.info(game.i18n.format('DAGGERHEART_SYNC.Info.SyncComplete', { name: actor.name }));
      }
      
      if (game.settings.get(this.MODULE_ID, 'debugMode')) {
        console.log('Daggerheart PDF Sync | Synced data for', actor.name, ':', pdfData);
      }

      // Emit socket event for multiplayer
      if (game.user.isGM) {
        game.socket.emit('module.daggerheart-sync', {
          type: 'syncUpdate',
          actorId: actor.id,
          userId: game.user.id
        });
      }
      
      return pdfData;

    } catch (error) {
      console.error('Daggerheart PDF Sync | Error syncing actor data:', error);
      if (!silent) ui.notifications.error(game.i18n.localize('DAGGERHEART_SYNC.Errors.SyncFailed'));
      return null;
    }
  }

  /**
   * Extract PDF data from actor
   * @private
   */
  static async _extractPDFData(actor) {
    return {
      // Character Info
      character: {
        name: ui.pdfpager.getPDFValue(actor, "doc_0_Character Name") || "",
        ancestry: ui.pdfpager.getPDFValue(actor, "doc_0_Ancestry") || "",
        community: ui.pdfpager.getPDFValue(actor, "doc_0_Community") || "",
        class: ui.pdfpager.getPDFValue(actor, "doc_0_Class") || "",
        subclass: ui.pdfpager.getPDFValue(actor, "doc_0_Subclass") || "",
        level: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Level")) || 1
      },

      // Attributes
      attributes: {
        agility: this._parseAttribute(actor, "Agility"),
        finesse: this._parseAttribute(actor, "Finesse"),
        instinct: this._parseAttribute(actor, "Instinct"),
        knowledge: this._parseAttribute(actor, "Knowledge"),
        presence: this._parseAttribute(actor, "Presence"),
        strength: this._parseAttribute(actor, "Strength")
      },

      // Resources
      resources: {
        hitPoints: {
          current: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Current Hit Points")) || 0,
          max: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Max Hit Points")) || 0
        },
        stress: {
          current: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Current Stress")) || 0,
          max: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Max Stress")) || 0
        },
        hope: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Hope")) || 0,
        armor: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Armor Score")) || 0
      },

      // Weapons
      weapons: {
        primary: this._parseWeapon(actor, "Primary"),
        secondary: this._parseWeapon(actor, "Secondary")
      },

      // Proficiency
      proficiency: {
        level: this._getMaxProficiency(actor),
        checked: Array.from({length: 5}, (_, i) => 
          !!ui.pdfpager.getPDFValue(actor, `doc_0_Proficiency${i + 2}`)
        )
      },

      // Experience
      experience: {
        current: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Current Experience")) || 0,
        total: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Total Experience")) || 0
      },

      // Metadata
      lastSync: Date.now(),
      version: game.modules.get(this.MODULE_ID).version
    };
  }

  /**
   * Parse attribute data
   * @private
   */
  static _parseAttribute(actor, attributeName) {
    const value = ui.pdfpager.getPDFValue(actor, `doc_0_${attributeName} Value`);
    const modifier = ui.pdfpager.getPDFValue(actor, `doc_0_${attributeName} Modifier`);
    
    return {
      value: parseInt(value) || 0,
      modifier: modifier || "+0",
      numericModifier: this._parseModifier(value)
    };
  }

  /**
   * Parse weapon data
   * @private
   */
  static _parseWeapon(actor, weaponType) {
    return {
      name: ui.pdfpager.getPDFValue(actor, `doc_0_${weaponType} Weapon Name`) || "",
      trait: ui.pdfpager.getPDFValue(actor, `doc_0_${weaponType} Weapon Trait`) || "Agility",
      range: ui.pdfpager.getPDFValue(actor, `doc_0_${weaponType} Weapon Range`) || "Melee",
      damage: ui.pdfpager.getPDFValue(actor, `doc_0_${weaponType} Weapon Damage Dice`) || "",
      type: ui.pdfpager.getPDFValue(actor, `doc_0_${weaponType} Weapon Damage Type`) || "phy",
      feature: ui.pdfpager.getPDFValue(actor, `doc_0_${weaponType} Weapon Feature`) || ""
    };
  }

  /**
   * Parse modifier text to number
   * @private
   */
  static _parseModifier(modifierText) {
    if (!modifierText) return 0;
    const cleanText = modifierText.toString().replace(/^\+/, "");
    return parseInt(cleanText) || 0;
  }

  /**
   * Get maximum proficiency level
   * @private
   */
  static _getMaxProficiency(actor) {
    for (let i = 6; i >= 2; i--) {
      const profValue = ui.pdfpager.getPDFValue(actor, `doc_0_Proficiency${i}`);
      if (profValue) {
        return i;
      }
    }
    return 1;
  }

  /**
   * Get synced data from actor
   * @param {Actor} actor - The actor
   * @param {string} path - Optional path to specific data (dot notation)
   */
  static getSyncedData(actor, path = null) {
    if (!actor) return null;
    
    const data = actor.getFlag(this.MODULE_ID, this.FLAG_KEY) || {};
    
    if (!path) return data;
    
    // Support dot notation (e.g., "weapons.primary.name")
    return path.split('.').reduce((obj, key) => obj?.[key], data);
  }

  /**
   * Check if actor data needs refresh
   * @param {Actor} actor - The actor
   * @param {number} maxAge - Maximum age in milliseconds
   */
  static needsRefresh(actor, maxAge = null) {
    if (!actor) return true;
    
    maxAge = maxAge || game.settings.get(this.MODULE_ID, 'syncInterval');
    const data = actor.getFlag(this.MODULE_ID, this.FLAG_KEY);
    
    if (!data || !data.lastSync) return true;
    
    return (Date.now() - data.lastSync) > maxAge;
  }

  /**
   * Ensure actor has fresh synced data
   * @param {Actor} actor - The actor
   */
  static async ensureFreshData(actor) {
    if (this.needsRefresh(actor)) {
      return await this.syncActor(actor, { silent: true });
    }
    return this.getSyncedData(actor);
  }

  /**
   * Clear synced data for actor
   * @param {Actor} actor - The actor
   */
  static async clearSyncedData(actor) {
    if (!actor) return;
    
    await actor.unsetFlag(this.MODULE_ID, this.FLAG_KEY);
    ui.notifications.info(game.i18n.format('DAGGERHEART_SYNC.Info.DataCleared', { name: actor.name }));
  }

  /**
   * Get sync status for actor
   * @param {Actor} actor - The actor
   */
  static getSyncStatus(actor) {
    if (!actor) return { synced: false, lastSync: null, needsRefresh: true };
    
    const data = actor.getFlag(this.MODULE_ID, this.FLAG_KEY);
    
    return {
      synced: !!data,
      lastSync: data?.lastSync ? new Date(data.lastSync) : null,
      needsRefresh: this.needsRefresh(actor),
      version: data?.version
    };
  }
}
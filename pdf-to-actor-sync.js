/**
 * PDF to Actor Data Sync Utility
 * Reads PDF field values and saves them to actor flags for use by other modules
 */

async function syncPDFToActor(targetActor = null) {
  const actor = targetActor || canvas.tokens.controlled[0]?.actor || game.user.character;
  
  if (!actor) {
    ui.notifications.warn("No actor selected!");
    return;
  }

  if (!ui.pdfpager) {
    ui.notifications.error("PDF-Pager module not found!");
    return;
  }

  try {
    // Read all PDF data
    const pdfData = {
      // Character Info
      character: {
        name: ui.pdfpager.getPDFValue(actor, "doc_0_Character Name") || "",
        ancestry: ui.pdfpager.getPDFValue(actor, "doc_0_Ancestry") || "",
        community: ui.pdfpager.getPDFValue(actor, "doc_0_Community") || "",
        class: ui.pdfpager.getPDFValue(actor, "doc_0_Class") || "",
        subclass: ui.pdfpager.getPDFValue(actor, "doc_0_Subclass") || "",
        level: ui.pdfpager.getPDFValue(actor, "doc_0_Level") || 1
      },

      // Attributes
      attributes: {
        agility: {
          value: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Agility Value")) || 0,
          modifier: ui.pdfpager.getPDFValue(actor, "doc_0_Agility Modifier") || "+0"
        },
        finesse: {
          value: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Finesse Value")) || 0,
          modifier: ui.pdfpager.getPDFValue(actor, "doc_0_Finesse Modifier") || "+0"
        },
        instinct: {
          value: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Instinct Value")) || 0,
          modifier: ui.pdfpager.getPDFValue(actor, "doc_0_Instinct Modifier") || "+0"
        },
        knowledge: {
          value: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Knowledge Value")) || 0,
          modifier: ui.pdfpager.getPDFValue(actor, "doc_0_Knowledge Modifier") || "+0"
        },
        presence: {
          value: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Presence Value")) || 0,
          modifier: ui.pdfpager.getPDFValue(actor, "doc_0_Presence Modifier") || "+0"
        },
        strength: {
          value: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Strength Value")) || 0,
          modifier: ui.pdfpager.getPDFValue(actor, "doc_0_Strength Modifier") || "+0"
        }
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
        primary: {
          name: ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Name") || "",
          trait: ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Trait") || "Agility",
          range: ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Range") || "Melee",
          damage: ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Damage Dice") || "",
          type: ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Damage Type") || "phy",
          feature: ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Feature") || ""
        },
        secondary: {
          name: ui.pdfpager.getPDFValue(actor, "doc_0_Secondary Weapon Name") || "",
          trait: ui.pdfpager.getPDFValue(actor, "doc_0_Secondary Weapon Trait") || "Agility",
          range: ui.pdfpager.getPDFValue(actor, "doc_0_Secondary Weapon Range") || "Melee",
          damage: ui.pdfpager.getPDFValue(actor, "doc_0_Secondary Weapon Damage Dice") || "",
          type: ui.pdfpager.getPDFValue(actor, "doc_0_Secondary Weapon Damage Type") || "phy",
          feature: ui.pdfpager.getPDFValue(actor, "doc_0_Secondary Weapon Feature") || ""
        }
      },

      // Proficiency
      proficiency: {
        level: getMaxProficiency(actor),
        checked: Array.from({length: 5}, (_, i) => 
          !!ui.pdfpager.getPDFValue(actor, `doc_0_Proficiency${i + 2}`)
        )
      },

      // Experience
      experience: {
        current: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Current Experience")) || 0,
        total: parseInt(ui.pdfpager.getPDFValue(actor, "doc_0_Total Experience")) || 0
      },

      // Last sync timestamp
      lastSync: Date.now()
    };

    // Save to actor flags
    await actor.setFlag("world", "daggerheart-syncedData", pdfData);
    
    ui.notifications.info(`PDF data synced for ${actor.name}`);
    console.log("Synced PDF Data:", pdfData);
    
    return pdfData;

  } catch (error) {
    console.error("Error syncing PDF data:", error);
    ui.notifications.error("Failed to sync PDF data!");
  }
}

// Helper function to get max proficiency
function getMaxProficiency(actor) {
  for (let i = 6; i >= 2; i--) {
    const profValue = ui.pdfpager.getPDFValue(actor, `doc_0_Proficiency${i}`);
    if (profValue) {
      return i;
    }
  }
  return 1;
}

// Function to get synced data
function getSyncedData(actor, path = null) {
  const data = actor.getFlag("world", "daggerheart-syncedData") || {};
  
  if (!path) return data;
  
  // Support dot notation (e.g., "weapons.primary.name")
  return path.split('.').reduce((obj, key) => obj?.[key], data);
}

// Function to check if data needs refresh
function needsRefresh(actor, maxAge = 300000) { // 5 minutes default
  const lastSync = actor.getFlag("world", "daggerheart-syncedData")?.lastSync;
  return !lastSync || (Date.now() - lastSync > maxAge);
}

// Auto-sync function for other macros to use
async function ensureSyncedData(actor) {
  if (needsRefresh(actor)) {
    await syncPDFToActor(actor);
  }
  return getSyncedData(actor);
}

// Main execution
if (typeof actor !== "undefined") {
  syncPDFToActor(actor);
} else {
  syncPDFToActor();
}

// Function to display synced data in a dialog
function showSyncedData(actor) {
  if (!actor) {
    ui.notifications.warn("No actor selected!");
    return;
  }
  
  const data = getSyncedData(actor);
  if (!data || !data.lastSync) {
    ui.notifications.warn("No synced data found. Run sync first!");
    return;
  }
  
  const lastSyncTime = new Date(data.lastSync).toLocaleString();
  
  new foundry.applications.api.DialogV2({
    window: {
      title: `Synced Data: ${actor.name}`,
      width: 600,
      height: 700,
      resizable: true
    },
    content: `
      <style>
        .sync-data-container {
          font-family: monospace;
          background: #1a1a1a;
          color: #fff;
          padding: 20px;
          border-radius: 8px;
          max-height: 600px;
          overflow-y: auto;
        }
        .sync-section {
          margin-bottom: 20px;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 10px;
        }
        .sync-section h3 {
          margin: 0 0 10px 0;
          color: #f39c12;
          border-bottom: 1px solid #555;
          padding-bottom: 5px;
        }
        .sync-item {
          margin: 5px 0;
          padding: 2px 0;
        }
        .sync-key {
          color: #3498db;
          font-weight: bold;
        }
        .sync-value {
          color: #2ecc71;
        }
        .sync-header {
          text-align: center;
          margin-bottom: 15px;
          padding: 10px;
          background: #2c3e50;
          border-radius: 4px;
        }
      </style>
      <div class="sync-data-container">
        <div class="sync-header">
          <strong>Last Synced:</strong> ${lastSyncTime}
        </div>
        
        <div class="sync-section">
          <h3>Character Info</h3>
          <div class="sync-item"><span class="sync-key">Name:</span> <span class="sync-value">${data.character?.name || 'N/A'}</span></div>
          <div class="sync-item"><span class="sync-key">Ancestry:</span> <span class="sync-value">${data.character?.ancestry || 'N/A'}</span></div>
          <div class="sync-item"><span class="sync-key">Community:</span> <span class="sync-value">${data.character?.community || 'N/A'}</span></div>
          <div class="sync-item"><span class="sync-key">Class:</span> <span class="sync-value">${data.character?.class || 'N/A'}</span></div>
          <div class="sync-item"><span class="sync-key">Subclass:</span> <span class="sync-value">${data.character?.subclass || 'N/A'}</span></div>
          <div class="sync-item"><span class="sync-key">Level:</span> <span class="sync-value">${data.character?.level || 'N/A'}</span></div>
        </div>
        
        <div class="sync-section">
          <h3>Attributes</h3>
          <div class="sync-item"><span class="sync-key">Agility:</span> <span class="sync-value">${data.attributes?.agility?.value || 0} (${data.attributes?.agility?.modifier || '+0'})</span></div>
          <div class="sync-item"><span class="sync-key">Finesse:</span> <span class="sync-value">${data.attributes?.finesse?.value || 0} (${data.attributes?.finesse?.modifier || '+0'})</span></div>
          <div class="sync-item"><span class="sync-key">Instinct:</span> <span class="sync-value">${data.attributes?.instinct?.value || 0} (${data.attributes?.instinct?.modifier || '+0'})</span></div>
          <div class="sync-item"><span class="sync-key">Knowledge:</span> <span class="sync-value">${data.attributes?.knowledge?.value || 0} (${data.attributes?.knowledge?.modifier || '+0'})</span></div>
          <div class="sync-item"><span class="sync-key">Presence:</span> <span class="sync-value">${data.attributes?.presence?.value || 0} (${data.attributes?.presence?.modifier || '+0'})</span></div>
          <div class="sync-item"><span class="sync-key">Strength:</span> <span class="sync-value">${data.attributes?.strength?.value || 0} (${data.attributes?.strength?.modifier || '+0'})</span></div>
        </div>
        
        <div class="sync-section">
          <h3>Resources</h3>
          <div class="sync-item"><span class="sync-key">Hit Points:</span> <span class="sync-value">${data.resources?.hitPoints?.current || 0} / ${data.resources?.hitPoints?.max || 0}</span></div>
          <div class="sync-item"><span class="sync-key">Stress:</span> <span class="sync-value">${data.resources?.stress?.current || 0} / ${data.resources?.stress?.max || 0}</span></div>
          <div class="sync-item"><span class="sync-key">Hope:</span> <span class="sync-value">${data.resources?.hope || 0}</span></div>
          <div class="sync-item"><span class="sync-key">Armor:</span> <span class="sync-value">${data.resources?.armor || 0}</span></div>
        </div>
        
        <div class="sync-section">
          <h3>Weapons</h3>
          <div class="sync-item"><span class="sync-key">Primary:</span> <span class="sync-value">${data.weapons?.primary?.name || 'None'} (${data.weapons?.primary?.trait || 'N/A'}, ${data.weapons?.primary?.damage || 'N/A'})</span></div>
          <div class="sync-item"><span class="sync-key">Secondary:</span> <span class="sync-value">${data.weapons?.secondary?.name || 'None'} (${data.weapons?.secondary?.trait || 'N/A'}, ${data.weapons?.secondary?.damage || 'N/A'})</span></div>
        </div>
        
        <div class="sync-section">
          <h3>Other</h3>
          <div class="sync-item"><span class="sync-key">Proficiency Level:</span> <span class="sync-value">${data.proficiency?.level || 1}</span></div>
          <div class="sync-item"><span class="sync-key">Experience:</span> <span class="sync-value">${data.experience?.current || 0} / ${data.experience?.total || 0}</span></div>
        </div>
      </div>
    `,
    buttons: [
      {
        action: "close",
        label: "Close",
        default: true
      },
      {
        action: "console",
        label: "Log to Console",
        callback: () => {
          console.log("Complete synced data for", actor.name, ":", data);
          ui.notifications.info("Data logged to console (F12)");
        }
      }
    ]
  }).render({ force: true });
}

// Export functions for other macros
window.DaggerheartSync = {
  syncPDFToActor,
  getSyncedData,
  needsRefresh,
  ensureSyncedData,
  showSyncedData
};
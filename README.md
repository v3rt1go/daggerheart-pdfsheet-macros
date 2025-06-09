# Daggerheart PDF Sync Module

A comprehensive Foundry VTT module for synchronizing PDF character sheet data with actor flags for the Daggerheart RPG system. Provides automatic data extraction from PDF-Pager sheets and intelligent caching for improved performance.

## Quick Install

**Manifest URL**: `https://raw.githubusercontent.com/v3rt1go/foundry-macros/daggerheart-sync-module/module.json`

Copy this URL into Foundry's "Install Module" dialog to install directly.

## Features

### 🔄 Automatic PDF Data Sync
- Extracts character data from PDF sheets using PDF-Pager
- Stores data in proper module flag scope for reliability
- Intelligent caching with configurable refresh intervals
- Real-time sync status indicators

### 📊 Comprehensive Data Extraction
- **Character Info**: Name, ancestry, community, class, subclass, level
- **Attributes**: All six core attributes with values and modifiers
- **Resources**: Hit points, stress, hope, armor score
- **Weapons**: Primary and secondary weapon details
- **Progression**: Proficiency levels and experience points

### 🎨 Professional UI
- Clean, themed dialogs with gradient backgrounds
- Mobile-responsive design
- Integrated actor sheet buttons
- Rich data visualization with status indicators

### ⚙️ Configurable Settings
- Auto-sync toggle
- Configurable sync intervals (1-30 minutes)
- Debug mode for troubleshooting
- Per-world configuration

### 🔗 Developer API
- Complete JavaScript API for other modules
- Socket support for multiplayer synchronization
- Event hooks for custom integrations

## Installation

### Prerequisites
- Foundry VTT v12+ (tested with v13)
- **PDF-Pager module** (required dependency)
- Daggerheart PDF character sheets

### Module Installation

#### Option 1: Direct Install (Recommended)
1. **Open Foundry VTT** and go to your world
2. **Click "Add-on Modules"** in the sidebar
3. **Click "Install Module"** button
4. **Paste this manifest URL**: 
   ```
   https://raw.githubusercontent.com/v3rt1go/foundry-macros/daggerheart-sync-module/module.json
   ```
5. **Click "Install"** and wait for download to complete
6. **Enable the module** in your world's module list
7. **Restart your world** for full functionality

#### Option 2: Manual Installation
1. **Download**: Go to [Releases](https://github.com/v3rt1go/foundry-macros/releases) and download the latest module zip
2. **Extract**: Unzip to your Foundry `Data/modules/` directory as `daggerheart-sync/`
3. **Enable**: Find "Daggerheart PDF Sync" in your world's Add-on Modules and enable it
4. **Restart**: Restart your world

#### Initial Configuration
After installation:
1. **Go to Settings** → **Configure Settings** → **Module Settings**
2. **Find "Daggerheart PDF Sync"** section
3. **Configure options**:
   - ✅ **Automatic Sync**: Enable for seamless operation
   - ⏱️ **Sync Interval**: Set to 5 minutes (default recommended)
   - 🐛 **Debug Mode**: Enable only for troubleshooting

## Usage

### Getting Started

#### 1. Setup Your Character
1. **Create or open an Actor** in Foundry
2. **Assign a PDF character sheet** using PDF-Pager module
3. **Fill out the PDF** with your character data
4. **Click the 🔄 Sync PDF button** in the actor sheet header

#### 2. Using the Module
Once installed, character actor sheets will have two new buttons in the header:
- **🔄 Sync PDF**: Manually sync PDF data to actor flags
- **👁️ View Synced Data**: Display all synced data in a formatted dialog

#### 3. Automatic Operation
With auto-sync enabled (default):
- **Data syncs automatically** when character sheets are opened
- **Background syncing** occurs at your configured interval
- **Smart caching** prevents unnecessary re-syncing
- **Real-time status** shows if data is fresh or stale

#### 4. Viewing Your Data
Click **👁️ View Synced Data** to see:
- ✅ **Complete character information** in organized sections
- 🕒 **Last sync timestamp** and freshness status
- 🔄 **Refresh button** to force immediate sync
- 📋 **Console logging** for debugging
- 🗑️ **Clear data** option to reset cache

### Advanced Usage

#### Working with Macros
The module works seamlessly with your existing Daggerheart macros:

```javascript
// In your weapon attack macros, use cached data instead of PDF lookups
const syncedData = game.modules.get('daggerheart-sync').api.sync.getSyncedData(actor);

// Get weapon info from cache (much faster than PDF queries)
const weaponName = syncedData?.weapons?.primary?.name || "Unknown Weapon";
const weaponTrait = syncedData?.weapons?.primary?.trait || "Agility";
const modifier = syncedData?.attributes?.agility?.numericModifier || 0;

// Use this data in your existing attack macros
console.log(`Attacking with ${weaponName} using ${weaponTrait} (${modifier})`);
```

#### Manual API Usage
```javascript
// Sync specific actor
const actor = game.actors.getName("Character Name");
await game.modules.get('daggerheart-sync').api.sync.syncActor(actor);

// Get all synced data
const data = game.modules.get('daggerheart-sync').api.sync.getSyncedData(actor);

// Get specific data with dot notation
const weaponName = game.modules.get('daggerheart-sync').api.sync.getSyncedData(actor, "weapons.primary.name");
const agilityMod = game.modules.get('daggerheart-sync').api.sync.getSyncedData(actor, "attributes.agility.numericModifier");

// Check sync status
const status = game.modules.get('daggerheart-sync').api.sync.getSyncStatus(actor);
console.log(`Data last synced: ${status.lastSync}, needs refresh: ${status.needsRefresh}`);
```

## Configuration

### Module Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Automatic Sync | Enabled | Auto-sync when sheets open and at intervals |
| Sync Interval | 5 minutes | How often to check for stale data |
| Debug Mode | Disabled | Enable detailed console logging |

### PDF Field Mapping
The module expects standard PDF field names:
- Character: `doc_0_Character Name`, `doc_0_Ancestry`, etc.
- Attributes: `doc_0_Strength Value`, `doc_0_Agility Value`, etc.
- Weapons: `doc_0_Primary Weapon Name`, `doc_0_Secondary Weapon Trait`, etc.
- Resources: `doc_0_Current Hit Points`, `doc_0_Hope`, etc.

## Developer API

### Core Functions

```javascript
const api = game.modules.get('daggerheart-sync').api;

// Sync operations
await api.sync.syncActor(actor, { silent: true });
await api.sync.ensureFreshData(actor);
await api.sync.clearSyncedData(actor);

// Data access
const data = api.sync.getSyncedData(actor);
const weaponData = api.sync.getSyncedData(actor, "weapons.primary");
const status = api.sync.getSyncStatus(actor);

// UI operations
api.ui.showSyncedData(actor);
```

### Event Hooks

```javascript
// Listen for sync completion
Hooks.on('daggerheartSyncComplete', (actor, data) => {
  console.log(`Synced data for ${actor.name}`, data);
});

// Listen for sync errors
Hooks.on('daggerheartSyncError', (actor, error) => {
  console.error(`Sync failed for ${actor.name}`, error);
});
```

### Socket Events
```javascript
// Listen for multiplayer sync updates
game.socket.on('module.daggerheart-sync', (data) => {
  if (data.type === 'syncUpdate') {
    // Handle sync update from another user
  }
});
```

## Troubleshooting

### Common Issues

**"PDF-Pager module not found"**
- Ensure PDF-Pager module is installed and enabled
- Check module compatibility versions

**"Flag scope not valid"**
- This error should not occur with the module (unlike the original macro)
- If it does, ensure the module is properly enabled

**Data not syncing**
- Enable Debug Mode in settings
- Check browser console (F12) for detailed logs
- Verify PDF field names match expected format
- Use "Log PDF Fields" button in actor sheets to identify field names

**Performance issues**
- Increase sync interval in settings
- Disable auto-sync for large campaigns
- Use manual sync only when needed

### Debug Mode
Enable debug mode in module settings to see:
- Detailed sync operations
- PDF field extraction results
- Performance timing information
- Error stack traces

## Integration with Other Macros

The synced data is perfect for use with the existing Daggerheart macro collection:

```javascript
// Enhanced weapon attack macro
const syncedData = game.modules.get('daggerheart-sync').api.sync.getSyncedData(actor);
const weapon = syncedData?.weapons?.primary;
const attribute = syncedData?.attributes?.agility;

if (weapon && attribute) {
  // Use cached data instead of PDF lookups
  const weaponName = weapon.name;
  const modifier = attribute.numericModifier;
}
```

## Changelog

### Version 1.0.0
- Initial release
- Full PDF data extraction and caching
- Actor sheet integration
- Configurable auto-sync
- Multiplayer support via sockets
- Comprehensive UI with data viewer
- Developer API and documentation

## License

This module is designed for use with the Daggerheart RPG system. Please respect all applicable licenses and terms of use.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with detailed description

## Support

For issues and feature requests:
- Check the troubleshooting section above
- Enable debug mode for detailed logging
- Report issues with console logs and reproduction steps
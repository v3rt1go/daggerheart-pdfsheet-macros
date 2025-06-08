# Daggerheart Attribute Roll Macros

This folder contains individual macros for rolling each of the six core attributes in Daggerheart using the duality dice system. These macros are designed to work with the PDF-Pager module's label-to-macro mapping feature.

## Included Macros

- `strength-roll.js` - Rolls duality dice with Strength modifier
- `finesse-roll.js` - Rolls duality dice with Finesse modifier  
- `instinct-roll.js` - Rolls duality dice with Instinct modifier
- `presence-roll.js` - Rolls duality dice with Presence modifier
- `knowledge-roll.js` - Rolls duality dice with Knowledge modifier
- `agility-roll.js` - Rolls duality dice with Agility modifier

## Features

- **Interactive dialog interface**: Click an attribute to open a customizable roll dialog
- **Pre-filled modifiers**: Automatically reads and pre-fills the attribute value from the PDF
- **Flexible die selection**: Choose between d12 and d20 for both Hope and Fear dice
- **Advantage/Disadvantage**: Add or subtract d6 dice for tactical situations
- **Custom modifiers**: Adjust the pre-filled modifier as needed
- **Duality dice system**: Rolls Hope and Fear dice with proper styling and colors
- **Critical detection**: Identifies when Hope and Fear dice match (critical success)
- **Hope/Fear tracking**: Shows when you gain Hope or the GM gains Fear
- **Custom dice appearance**: Hope dice are green with gold text, Fear dice are red with gold text

## Setup Instructions

### 1. Install Required Modules
- Install the **PDF-Pager** module in Foundry VTT
- Ensure you have a Daggerheart character sheet PDF (like `Bard.pdf`)

### 2. Import Macros to Foundry
1. In Foundry VTT, go to the **Macros** sidebar
2. Create a new macro for each attribute:
   - Click "Create Macro"
   - Set Type to "Script"
   - Copy the content from each `.js` file into the macro
   - Name appropriately (e.g., "Strength Roll", "Finesse Roll", etc.)
   - Save the macro

### 3. Configure PDF-Pager Mapping
1. **Enable field mapping**:
   - Go to Module Settings → PDF-Pager
   - Enable "Edit Field Mapping"

2. **Open your character's PDF sheet**:
   - Create or open an Actor
   - Set the Actor sheet to use the PDF character sheet

3. **Map labels to macros**:
   - Look for the attribute names in the PDF (e.g., "Strength", "Finesse", etc.)
   - Click on each attribute label
   - Select the corresponding macro from the dropdown
   - Repeat for all six attributes

4. **Disable field mapping**:
   - Return to Module Settings → PDF-Pager
   - Disable "Edit Field Mapping"

### 4. Usage
Once configured, click on any attribute name in the PDF character sheet to open an interactive dialog where you can:

1. **Select die sizes**: Choose d12 or d20 for Hope and Fear dice
2. **Add advantage/disadvantage**: Enter number of advantage or disadvantage dice
3. **Adjust modifier**: The attribute value is pre-filled but can be modified
4. **Roll**: Click "Roll" to execute the duality dice roll

The dialog will automatically populate the modifier field with the current value from your character sheet (e.g., if your Strength shows "+2", the modifier field will start with "2").

## PDF Field Names
The macros look for these specific field names in the PDF:
- `doc_0_Strength Value`
- `doc_0_Finesse Value`
- `doc_0_Instinct Value`
- `doc_0_Presence Value`
- `doc_0_Knowledge Value`
- `doc_0_Agility Value`

## Customization
You can modify these macros to:
- Change default Hope/Fear die sizes in the dialog (currently both default to d12)
- Modify dice appearance and colors
- Change the chat message formatting
- Add additional dialog options or validation
- Customize the dialog styling and layout

## Troubleshooting
- **Modifier not detected**: Ensure the PDF field contains a value like "+2", "-1", or "0"
- **Macro not triggering**: Check that the label mapping is correctly configured
- **Dialog not opening**: Ensure the macro is properly imported and assigned to the label
- **Wrong field**: Verify the PDF field names match those listed above using the "Log PDF Fields" button in the actor sheet
- **Dialog styling issues**: Ensure you're using a compatible version of Foundry VTT (v10+)

## Support
These macros are designed for the Daggerheart RPG system and require the PDF-Pager module for full functionality.
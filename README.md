# Daggerheart PDF Character Sheet Macros

A comprehensive collection of macros for the Daggerheart RPG system, designed to work seamlessly with PDF character sheets in Foundry VTT using the PDF-Pager module.

## Overview

This project provides a complete macro suite for playing Daggerheart in Foundry VTT, featuring automated dice rolling with Hope/Fear mechanics, weapon attacks, attribute rolls, and elegant UI dialogs. All macros are designed to integrate with PDF character sheets using field mapping through the PDF-Pager module.

## Features

### ⚔️ Weapon Attack Macros
- **Primary Weapon Attack**: Fully automated weapon attacks with damage calculation
- **Secondary Weapon Attack**: Complete secondary weapon support
- **Compact UI**: Space-efficient dialog and chat layouts
- **Professional Design**: Clean, themed interface with gradient backgrounds
- **Automatic PDF Integration**: Reads weapon stats directly from character sheets

### 🎲 Attribute Roll Macros
- Individual macros for all six core attributes:
  - Agility Roll
  - Finesse Roll
  - Instinct Roll
  - Knowledge Roll
  - Presence Roll
  - Strength Roll
- Automated modifier calculation from character sheets
- Hope/Fear dice mechanics with custom styling

### 🎯 Duality Dice System
- Custom Hope and Fear dice implementation
- Automatic critical success detection (matching dice)
- Visual dice styling for Dice So Nice module
- Result banners with appropriate effects

### 📋 Character Sheets
High-quality PDF character sheets for all classes:
- Bard
- Druid
- Guardian
- Ranger
- Rogue
- Seraph
- Sorcerer
- Warrior
- Wizard
- Generic Character Sheet

## Installation

### Prerequisites
1. **Foundry VTT** (v10 or higher recommended)
2. **PDF-Pager Module** - Required for PDF character sheet integration
3. **Dice So Nice Module** (optional) - For enhanced dice animations

### Setup Instructions

1. **Download the Macros**
   - Clone or download this repository
   - Extract to your desired location

2. **Import Character Sheets**
   - Copy the character sheets from the `character-sheets/` folder
   - Import them into Foundry VTT using the PDF-Pager module
   - Configure field mappings using the provided `bard_pdf_fields.json` as reference

3. **Install Macros**
   - Import the macro files into your Foundry VTT world
   - Place them in your macro toolbar for easy access

4. **Configure PDF-Pager**
   - Use the included `pdf-pager/` module for advanced PDF functionality
   - Set up field mappings for character data extraction

## Usage

### Weapon Attacks

1. **Select Your Character**: Ensure you have a character with a PDF sheet selected
2. **Run the Macro**: Click the Primary or Secondary Weapon Attack macro
3. **Configure Your Roll**:
   - Choose Hope and Fear die sizes (d12 or d20)
   - Set advantage/disadvantage dice
   - Adjust trait modifiers
4. **Execute**: Click the attack button to roll and see results in chat

### Attribute Rolls

1. **Select Character**: Choose your character token or sheet
2. **Run Attribute Macro**: Click any of the six attribute roll macros
3. **Set Parameters**:
   - Choose die sizes for Hope/Fear dice
   - Add advantage/disadvantage
   - Apply situational modifiers
4. **Roll**: Execute to see results with automatic success/failure detection

### Character Sheet Integration

The macros automatically read the following data from your PDF character sheets:
- **Weapon Stats**: Name, trait, range, damage, type, features
- **Attribute Values**: All six core attributes with modifiers
- **Proficiency Levels**: Automatic detection of highest marked proficiency
- **Character Details**: Name and other relevant information

## Macro Features

### Dialog Interface
- **Compact Design**: Space-efficient 2-column layout
- **Visual Clarity**: Emoji icons and clear labeling
- **Responsive**: Automatically adjusts to content
- **Professional Styling**: Dark theme with gradient backgrounds

### Chat Output
- **Rich Formatting**: Color-coded results with visual indicators
- **Compact Cards**: Efficient space usage in chat
- **Clear Results**: Easy-to-read damage, effects, and outcomes
- **Dice Integration**: Works with Dice So Nice for 3D dice rolling

### Automation Features
- **Auto-Calculation**: Damage dice based on proficiency and weapon stats
- **Smart Defaults**: Reasonable fallbacks when data is missing
- **Error Handling**: Graceful degradation with missing character data
- **Consistent Styling**: Unified visual theme across all macros

## File Structure

```
foundry-macros/
├── character-sheets/          # PDF character sheets for all classes
├── daggerheart-attribute-macros/  # Individual attribute roll macros
├── daggerheart-weapon-attacks/    # Primary and secondary weapon macros
├── pdf-pager/                 # PDF-Pager module for sheet integration
├── bard_pdf_fields.json       # Example field mapping configuration
├── daggerheart-duality-dice.js    # Core dice rolling system
├── daggerheart-roller-macro.js    # General purpose roller
└── README.md                  # This file
```

## Customization

### Modifying Macros
- Edit the JavaScript files to customize behavior
- Adjust CSS styling in the dialog templates
- Modify dice appearance for Dice So Nice integration

### Adding New Weapons
- Update character sheet PDF fields
- Ensure proper field mapping in PDF-Pager
- Macros will automatically detect new weapon data

### Custom Styling
- Modify CSS classes in macro files
- Adjust colors, fonts, and layout
- Customize dice appearance and animations

## Troubleshooting

### Common Issues

**Macro Not Reading Character Data**
- Ensure PDF-Pager module is installed and active
- Verify character sheet field mappings
- Check that a character is properly selected

**Dice Not Appearing**
- Confirm Dice So Nice module is installed (optional)
- Check that dice expressions are valid
- Ensure character has required attribute values

**Dialog Not Displaying Properly**
- Verify Foundry VTT version compatibility
- Check browser console for JavaScript errors
- Ensure all required character data is present

## Contributing

Feel free to contribute improvements, bug fixes, or new features:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with your changes

## License

This project is designed for use with the Daggerheart RPG system. Please respect all applicable licenses and terms of use.

---

## TODO List

### Priority Improvements

- [ ] **Deal with criticals for weapon attacks** - Implement proper critical hit mechanics and special effects
- [ ] **Display ancestry card to chat** - Send ancestry information and abilities to chat
- [ ] **Display community card to chat** - Send community background details to chat
- [ ] **Display subclass card to chat** - Send subclass features and abilities to chat
- [ ] **Display type card to chat** - Send character type information to chat
- [ ] **Display domain card to chat** - Send domain-specific information to chat
- [ ] **Send hope feature to chat** - Create macro to display hope features in chat
- [ ] **Send class feature to chat** - Create macro to display class features in chat
- [ ] **Add support for class-specific sheets for class features** - Implement per-class feature templates
- [ ] **Add support for class-specific sheets for hope features** - Implement per-class hope feature templates

### Future Enhancements

- [ ] Spell casting macros for magical classes
- [ ] Equipment management macros
- [ ] Status effect tracking
- [ ] Experience point calculation
- [ ] Inventory management integration
- [ ] Party coordination features
- [ ] GM utility macros
- [ ] Combat automation tools
- [ ] Character advancement tracking
- [ ] Session management utilities
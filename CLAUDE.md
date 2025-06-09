# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Foundry VTT macro collection for the Daggerheart RPG system. The macros integrate with PDF character sheets using the PDF-Pager module to provide automated dice rolling, weapon attacks, attribute rolls, and character sheet data extraction.

## Key Architecture

### Core Dice System
- **Duality Dice Mechanics**: All rolls use Hope (green/gold) and Fear (blue) dice with matching results indicating critical success
- **Dice Styling**: Custom appearance configurations for Dice So Nice module integration
- **Roll Expression Building**: Dynamic roll expressions with advantage/disadvantage and modifiers

### PDF Integration Pattern
- **Field Naming Convention**: PDF fields use `doc_0_[Field Name]` format (e.g., `doc_0_Strength Value`)
- **Data Extraction**: `ui.pdfpager.getPDFValue(actor, fieldName)` retrieves values from character sheets
- **Label Mapping**: PDF-Pager maps clickable labels to macros for attribute rolls

### UI Dialog Architecture
- **DialogV2 API**: All macros use Foundry's modern DialogV2 for consistent interfaces
- **Gradient Styling**: Dark theme with blue/teal gradients and professional appearance
- **Compact Layout**: 2-column grid layouts for efficient space usage
- **Responsive Design**: Flexible width containers with minimum width constraints

### Weapon Attack System
- **Damage Formula Parsing**: Supports various formats (d8+3, 2d6, d10) with proficiency-based dice counts
- **Proficiency Detection**: Scans `doc_0_Proficiency[2-6]` fields to find highest marked level
- **Trait Integration**: Maps weapon traits to character attributes for automatic modifier calculation
- **Enhanced Chat Output**: Rich formatting with weapon stats, damage breakdown, and outcome banners

## File Structure

```
daggerheart-attribute-macros/     # Individual attribute roll macros (6 files)
daggerheart-weapon-attacks/       # Primary and secondary weapon attack macros
character-sheets/                 # PDF character sheets for all classes
pdf-pager/                       # PDF-Pager module integration
daggerheart-duality-dice.js      # Core duality dice system with enhanced UI
daggerheart-roller-macro.js      # Simplified version of dice roller
bard_pdf_fields.json            # Example field mapping configuration
```

## Development Commands

This is a client-side JavaScript macro collection for Foundry VTT. No build process or testing framework is used.

**Testing**: Import macros into Foundry VTT and test with PDF character sheets
**Debugging**: Use browser console (`F12`) to view roll expressions and errors
**PDF Field Discovery**: Use "Log PDF Fields" button in actor sheets to identify field names

## Common Development Patterns

### Roll Expression Format
```javascript
let rollExpression = `1${hopeDieSize}[Hope] + 1${fearDieSize}[Fear]`;
if (totalAdvantage !== 0) {
    rollExpression += ` ${totalAdvantage > 0 ? "+" : ""} ${totalAdvantage}d6kh`;
}
```

### PDF Data Extraction
```javascript
const weaponName = ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Name") || "";
const traitValue = ui.pdfpager.getPDFValue(actor, "doc_0_Agility Value");
const modifier = parseInt(traitValue?.toString().replace(/^\+/, "")) || 0;
```

### Dice Styling Pattern
```javascript
roll.dice[0].options.appearance = {
    colorset: "custom",
    foreground: "#000000",
    background: "#FFD700", // Hope dice: gold
    // ... other appearance options
};
```

### Dialog Content Structure
- Container with gradient background and professional styling
- Weapon info section with compact grid layout
- Dice selection with radio buttons and custom styling
- Modifiers section with number inputs
- Consistent button styling and interactions

## PDF Field Naming Conventions

**Attributes**: `doc_0_[Attribute] Value` (e.g., `doc_0_Strength Value`)
**Weapons**: `doc_0_[Primary/Secondary] Weapon [Property]` 
**Proficiency**: `doc_0_Proficiency[2-6]` (checkbox fields)
**General**: Most fields follow `doc_0_[Field Name]` pattern

## Priority TODO Items

The README contains a comprehensive TODO list. Key priorities:
- Critical hit mechanics for weapon attacks
- Character card display macros (ancestry, community, subclass, etc.)
- Class-specific feature templates
- Spell casting macros for magical classes
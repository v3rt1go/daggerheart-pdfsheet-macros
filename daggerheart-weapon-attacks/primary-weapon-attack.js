/**
 * Daggerheart Primary Weapon Attack Macro
 * For use with PDF-Pager label mapping
 * Maps to "Primary Weapon" label in character sheet
 */

function modifierNumberToExpression(modifier) {
  if (modifier === 0) return "";
  return modifier > 0 ? `+${modifier}` : `${modifier}`;
}

// Function to parse damage formula and determine number of dice
function parseDamageFormula(damageFormula, maxProficiency) {
  if (!damageFormula || damageFormula.trim() === "") {
    return { numDice: maxProficiency, dieType: "d6", modifier: 0 };
  }

  // Clean the formula
  const clean = damageFormula.trim().toLowerCase();

  // Check if it already includes number of dice (e.g., "2d8+4", "3d6-1")
  const fullDiceMatch = clean.match(/^(\d+)(d\d+)([+-]\d+)?$/);
  if (fullDiceMatch) {
    return {
      numDice: parseInt(fullDiceMatch[1]),
      dieType: fullDiceMatch[2],
      modifier: fullDiceMatch[3] ? parseInt(fullDiceMatch[3]) : 0,
    };
  }

  // Check for simple die + modifier (e.g., "d8+3", "d10-2")
  const simpleDiceMatch = clean.match(/^(d\d+)([+-]\d+)?$/);
  if (simpleDiceMatch) {
    return {
      numDice: maxProficiency,
      dieType: simpleDiceMatch[1],
      modifier: simpleDiceMatch[2] ? parseInt(simpleDiceMatch[2]) : 0,
    };
  }

  // Check for just die type (e.g., "d8", "d10")
  const dieOnlyMatch = clean.match(/^(d\d+)$/);
  if (dieOnlyMatch) {
    return {
      numDice: maxProficiency,
      dieType: dieOnlyMatch[1],
      modifier: 0,
    };
  }

  // Default fallback
  return { numDice: maxProficiency, dieType: "d6", modifier: 0 };
}

// Function to get maximum checked proficiency
function getMaxProficiency(actor) {
  if (!actor) return 1;

  // Proficiency fields go from 2 to 6
  for (let i = 6; i >= 2; i--) {
    const profValue = ui.pdfpager.getPDFValue(actor, `doc_0_Proficiency${i}`);
    if (profValue) {
      return i;
    }
  }
  return 1; // Default to 1 if no proficiency is checked
}

async function rollWeaponAttack(
  hopeDieSize,
  fearDieSize,
  advantage,
  disadvantage,
  traitModifier,
  weaponName,
  weaponTrait,
  weaponRange,
  damageFormula,
  damageType,
  weaponFeature,
  maxProficiency
) {
  // Parse damage formula
  const damageInfo = parseDamageFormula(damageFormula, maxProficiency);

  // Build attack roll expression with labeled dice
  let attackExpression = `1${hopeDieSize}[Hope] + 1${fearDieSize}[Fear]`;

  // Add advantage/disadvantage dice
  let totalAdvantage = advantage - disadvantage;
  if (totalAdvantage !== 0) {
    attackExpression += ` ${
      totalAdvantage > 0 ? "+" : ""
    } ${totalAdvantage}d6kh`;
  }

  // Add trait modifier
  if (traitModifier !== 0) {
    attackExpression += ` ${modifierNumberToExpression(traitModifier)}`;
  }

  console.log(`${weaponName} Attack Expression:`, attackExpression);

  // Execute the attack roll
  const attackRoll = await new Roll(attackExpression).evaluate();

  // Build damage roll expression
  let damageExpression = `${damageInfo.numDice}${damageInfo.dieType}`;
  if (damageInfo.modifier !== 0) {
    damageExpression += modifierNumberToExpression(damageInfo.modifier);
  }

  console.log(`${weaponName} Damage Expression:`, damageExpression);

  // Execute the damage roll
  const damageRoll = await new Roll(damageExpression).evaluate();

  // Get actual Hope and Fear die results
  const hopeResult = attackRoll.dice[0].total;
  const fearResult = attackRoll.dice[1].total;

  // Determine outcome
  const isCrit = hopeResult === fearResult;
  const isHope = hopeResult > fearResult;
  const isFear = hopeResult < fearResult;

  // Style the attack dice for Dice So Nice
  if (attackRoll.dice[0]) {
    attackRoll.dice[0].options.appearance = {
      colorset: "custom",
      foreground: "#000000",
      background: "#FFD700",
      outline: "#000000",
      edge: "#FFA500",
      texture: "ice",
      material: "metal",
      font: "Eczar",
      system: "standard",
    };
  }

  if (attackRoll.dice[1]) {
    attackRoll.dice[1].options.appearance = {
      colorset: "custom",
      foreground: "#FFFFFF",
      background: "#1e3a8a",
      outline: "#000000",
      edge: "#1e40af",
      texture: "skulls",
      material: "metal",
      font: "Eczar",
      system: "standard",
    };
  }

  // Style advantage/disadvantage dice
  if (attackRoll.dice.length > 2) {
    const advDice = attackRoll.dice.slice(2);
    const isPositive = totalAdvantage > 0;

    for (const die of advDice) {
      die.options.appearance = {
        colorset: "custom",
        foreground: "#FFFFFF",
        background: isPositive ? "#2ecc71" : "#e74c3c",
        outline: isPositive ? "#145a32" : "#641e16",
        edge: isPositive ? "#145a32" : "#641e16",
        texture: "crystal",
        material: "metal",
        font: "Eczar",
        system: "standard",
      };
    }
  }

  // Style damage dice
  for (const die of damageRoll.dice) {
    die.options.appearance = {
      colorset: "custom",
      foreground: "#FFFFFF",
      background: "#8b0000",
      outline: "#000000",
      edge: "#a50000",
      texture: "fire",
      material: "metal",
      font: "Eczar",
      system: "standard",
    };
  }

  // Create enhanced result display
  let resultBanner = "";
  let resultColor = "";
  let resultEffect = "";

  if (isCrit) {
    resultBanner = "💫 CRITICAL SUCCESS 💫";
    resultColor = "#9932CC";
    resultEffect = "You gain a Hope and clear a Stress";
  } else if (isHope) {
    resultBanner = "🌟 ROLLED WITH HOPE 🌟";
    resultColor = "#DAA520";
    resultEffect = "You gain a Hope";
  } else if (isFear) {
    resultBanner = "💀 ROLLED WITH FEAR 💀";
    resultColor = "#1e3a8a";
    resultEffect = "The GM gains a Fear";
  }

  const enhancedFlavor = `
    <div style="border: 3px solid ${resultColor}; border-radius: 10px; padding: 20px; margin: 10px 0; background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1)); box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
        <div style="text-align: center; font-size: 20px; font-weight: bold; color: ${resultColor}; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
            ⚔️ ${weaponName.toUpperCase() || "PRIMARY WEAPON"} ATTACK ⚔️
        </div>
        
        <div style="text-align: center; font-size: 16px; font-weight: bold; color: ${resultColor}; margin-bottom: 10px;">
            ${resultBanner}
        </div>
        
        <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
            <div style="text-align: center; padding: 15px; border-radius: 8px; background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; font-weight: bold; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                <div style="font-size: 18px; margin-bottom: 5px;">✨ HOPE</div>
                <div style="font-size: 36px;">${hopeResult}</div>
            </div>
            <div style="text-align: center; padding: 15px; border-radius: 8px; background: linear-gradient(135deg, #1e3a8a, #1e40af); color: #FFF; font-weight: bold; min-width: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                <div style="font-size: 18px; margin-bottom: 5px;">💀 FEAR</div>
                <div style="font-size: 36px;">${fearResult}</div>
            </div>
        </div>
        
        <div style="text-align: center; margin: 15px 0;">
            <div style="display: inline-block; padding: 10px 20px; border-radius: 8px; background: linear-gradient(135deg, #8b0000, #a50000); color: #FFF; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                <div style="font-size: 16px; margin-bottom: 5px;">💥 DAMAGE</div>
                <div style="font-size: 24px;">${
                  damageRoll.total
                } ${damageType}</div>
            </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; margin: 10px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; line-height: 1.3;">
                <div><strong>⚔️</strong> ${weaponName || "Unnamed"}</div>
                <div><strong>📊</strong> ${weaponTrait}</div>
                <div><strong>🎯</strong> ${weaponRange}</div>
                <div><strong>💥</strong> ${damageType}</div>
                <div><strong>⭐</strong> Prof: ${maxProficiency}</div>
                <div><strong>🎲</strong> ${damageFormula || "Not Set"}</div>
                ${
                  weaponFeature
                    ? `<div style="grid-column: 1 / -1; font-size: 11px;"><strong>✨</strong> ${weaponFeature}</div>`
                    : ""
                }
            </div>
        </div>
        
        <div style="text-align: center; font-size: 16px; font-weight: bold; color: ${
          resultColor === "#DAA520" ? "#B8860B" : resultColor
        }; margin-top: 15px;">
            ${resultEffect}
        </div>
    </div>
  `;

  // Send attack roll to chat
  await attackRoll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: enhancedFlavor,
    rollMode: game.settings.get("core", "rollMode"),
  });

  // Send damage roll separately for clarity
  await damageRoll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: `<div style="text-align: center; font-weight: bold; color: #8b0000;">🎯 ${
      weaponName || "Primary Weapon"
    } Damage Roll</div>`,
    rollMode: game.settings.get("core", "rollMode"),
  });
}

// Main execution
(async () => {
  // Get weapon details from PDF fields
  let weaponName = "";
  let weaponTrait = "Agility";
  let weaponRange = "Melee";
  let damageFormula = "";
  let damageType = "phy";
  let weaponFeature = "";
  let defaultModifier = 0;

  if (actor) {
    weaponName =
      ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Name") || "";
    weaponTrait =
      ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Trait") || "Agility";
    weaponRange =
      ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Range") || "Melee";
    damageFormula =
      ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Damage Dice") || "";
    damageType =
      ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Damage Type") ||
      "phy";
    weaponFeature =
      ui.pdfpager.getPDFValue(actor, "doc_0_Primary Weapon Feature") || "";

    // Get the trait modifier based on the selected trait
    const traitFieldMap = {
      Agility: "doc_0_Agility Value",
      Finesse: "doc_0_Finesse Value",
      Instinct: "doc_0_Instinct Value",
      Presence: "doc_0_Presence Value",
      Knowledge: "doc_0_Knowledge Value",
      Strength: "doc_0_Strength Value",
    };

    const traitField = traitFieldMap[weaponTrait];
    if (traitField) {
      const traitText = ui.pdfpager.getPDFValue(actor, traitField);
      if (traitText) {
        const cleanText = traitText.toString().replace(/^\+/, "");
        defaultModifier = parseInt(cleanText) || 0;
      }
    }
  }

  // Get maximum proficiency
  const maxProficiency = getMaxProficiency(actor);

  // Launch the enhanced UI dialog
  new foundry.applications.api.DialogV2({
    window: {
      title: "⚔️ Primary Weapon Attack ⚔️",
      width: 750,
      height: "auto",
      resizable: true,
    },
    content: `
        <style>
            .dh-container {
                padding: 20px;
                background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                border-radius: 15px;
                color: #ecf0f1;
                box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
                border: 2px solid #34495e;
                min-width: 700px;
                max-width: 100%;
            }
            .dh-title {
                text-align: center;
                font-size: 22px;
                font-weight: bold;
                margin-bottom: 20px;
                background: linear-gradient(45deg, #f1c40f, #e67e22, #e74c3c);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 15px rgba(241, 196, 15, 0.3);
                letter-spacing: 1px;
            }
            .weapon-info {
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
                border: 2px solid rgba(255,255,255,0.2);
            }
            .weapon-stats-compact {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .weapon-row {
                display: grid;
                grid-template-columns: auto 1fr auto 1fr;
                gap: 10px;
                align-items: center;
                padding: 8px 12px;
                background: rgba(0,0,0,0.3);
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .weapon-label {
                font-size: 13px;
                color: #bdc3c7;
                font-weight: bold;
                min-width: fit-content;
            }
            .weapon-value {
                font-size: 14px;
                font-weight: bold;
                color: #ecf0f1;
                text-align: left;
            }
            .weapon-feature {
                grid-column: 1 / -1;
                padding: 8px 12px;
                background: rgba(0,0,0,0.3);
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.1);
                font-size: 13px;
            }
            .dh-dice-section {
                background: rgba(255,255,255,0.08);
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 8px 16px rgba(0,0,0,0.4);
                border: 2px solid rgba(255,255,255,0.15);
                backdrop-filter: blur(10px);
                margin-bottom: 15px;
            }
            .hope-text {
                color: #f1c40f;
                text-shadow: 0 0 20px #f39c12, 0 0 40px #f1c40f;
                font-weight: bold;
                font-size: 22px;
                margin-bottom: 15px;
                letter-spacing: 1px;
            }
            .fear-text {
                color: #3b82f6;
                text-shadow: 0 0 20px #1e40af, 0 0 40px #3b82f6;
                font-weight: bold;
                font-size: 22px;
                margin-bottom: 15px;
                letter-spacing: 1px;
            }
            .die-toggle {
                display: none;
            }
            .die-toggle + label {
                padding: 15px 25px;
                background: linear-gradient(135deg, #34495e, #2c3e50);
                border: 2px solid #7f8c8d;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 0 6px 12px rgba(0,0,0,0.4);
                text-transform: uppercase;
                letter-spacing: 1px;
                min-width: 80px;
                text-align: center;
            }
            .die-toggle:checked + label {
                background: linear-gradient(135deg, #e67e22, #d35400);
                border-color: #f39c12;
                color: white;
                box-shadow: 0 0 25px rgba(230, 126, 34, 0.7), 0 6px 12px rgba(0,0,0,0.4);
                transform: translateY(-3px);
            }
            .die-toggle + label:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.5);
            }
            .modifiers-section {
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 20px;
                border: 2px solid rgba(255,255,255,0.12);
                backdrop-filter: blur(8px);
                box-shadow: 0 6px 12px rgba(0,0,0,0.3);
            }
            .number-input {
                background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(52,73,94,0.5));
                border: 2px solid #95a5a6;
                border-radius: 12px;
                color: white;
                text-align: center;
                padding: 15px;
                width: 100px;
                font-size: 20px;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: inset 0 3px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2);
            }
            .number-input:focus {
                border-color: #3498db;
                box-shadow: 0 0 20px rgba(52, 152, 219, 0.6), inset 0 3px 6px rgba(0,0,0,0.4);
                outline: none;
                transform: translateY(-1px);
            }
            .modifier-input {
                background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(52,73,94,0.5));
                border: 2px solid #95a5a6;
                border-radius: 12px;
                color: white;
                text-align: center;
                padding: 15px;
                min-width: 30px;
                max-width: 10em;
                font-size: 22px;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: inset 0 3px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2);
            }
            .modifier-input:focus {
                border-color: #9b59b6;
                box-shadow: 0 0 20px rgba(155, 89, 182, 0.6), inset 0 3px 6px rgba(0,0,0,0.4);
                outline: none;
                transform: translateY(-1px);
            }
            .section-label {
                font-size: 18px;
                font-weight: bold;
                color: #ecf0f1;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 12px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.7);
            }
            .dh-col {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
                flex: 1;
            }
            .dice-single-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin: 15px 0;
                flex-wrap: wrap;
            }
            .modifiers-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 40px;
                align-items: center;
                justify-items: center;
                margin: 25px 0;
            }
        </style>
        
        <div class="dh-container">
            <div class="dh-title">⚔️ ${
              weaponName.toUpperCase() || "PRIMARY WEAPON"
            } ATTACK ⚔️</div>
            
            <div class="weapon-info">
                <div class="weapon-stats-compact">
                    <div class="weapon-row">
                        <span class="weapon-label">⚔️ Weapon:</span>
                        <span class="weapon-value">${weaponName || "Unnamed"}</span>
                        <span class="weapon-label">📊 Trait:</span>
                        <span class="weapon-value">${weaponTrait}</span>
                    </div>
                    <div class="weapon-row">
                        <span class="weapon-label">🎯 Range:</span>
                        <span class="weapon-value">${weaponRange}</span>
                        <span class="weapon-label">🎲 Damage:</span>
                        <span class="weapon-value">${damageFormula || "Not Set"}</span>
                    </div>
                    <div class="weapon-row">
                        <span class="weapon-label">💥 Type:</span>
                        <span class="weapon-value">${damageType}</span>
                        <span class="weapon-label">⭐ Prof:</span>
                        <span class="weapon-value">${maxProficiency}</span>
                    </div>
                    ${
                      weaponFeature
                        ? `<div class="weapon-feature"><span class="weapon-label">✨ Features:</span> ${weaponFeature}</div>`
                        : ""
                    }
                </div>
            </div>
            
            <div class="dh-dice-section">
                <div class="dice-single-row">
                    <span class="hope-text">✨ HOPE DIE ✨</span>
                    <input id="hope-d12" class="die-toggle" name="hopeDie" value="d12" type="radio" checked>
                    <label for="hope-d12">d12</label>
                    <input id="hope-d20" class="die-toggle" name="hopeDie" value="d20" type="radio">
                    <label for="hope-d20">d20</label>
                    
                    <span class="fear-text" style="margin-left: 40px;">💀 FEAR DIE 💀</span>
                    <input id="fear-d12" class="die-toggle" name="fearDie" value="d12" type="radio" checked>
                    <label for="fear-d12">d12</label>
                    <input id="fear-d20" class="die-toggle" name="fearDie" value="d20" type="radio">
                    <label for="fear-d20">d20</label>
                </div>
            </div>
            
            <div class="modifiers-section">
                <div class="modifiers-grid">
                    <div class="dh-col">
                        <span class="section-label">⬆️ Advantage</span>
                        <input name="advantage" class="number-input" type="number" min="0" max="10" value="0">
                    </div>
                    
                    <div class="dh-col">
                        <span class="section-label">⬇️ Disadvantage</span>
                        <input name="disadvantage" class="number-input" type="number" min="0" max="10" value="0">
                    </div>
                    
                    <div class="dh-col">
                        <span class="section-label">🎯 ${weaponTrait} Modifier</span>
                        <input name="modifier" class="modifier-input" type="number" step="1" value="${defaultModifier}" placeholder="±0">
                    </div>
                </div>
            </div>
        </div>
    `,
    buttons: [
      {
        action: "roll",
        label: `⚔️ ATTACK WITH ${weaponName.toUpperCase() || "WEAPON"}`,
        default: true,
        callback: (event, button, dialog) => {
          return {
            hopeDie: button.form.elements.hopeDie.value,
            fearDie: button.form.elements.fearDie.value,
            advantage: button.form.elements.advantage.valueAsNumber || 0,
            disadvantage: button.form.elements.disadvantage.valueAsNumber || 0,
            modifier: button.form.elements.modifier.valueAsNumber || 0,
          };
        },
      },
      {
        action: "cancel",
        label: "Cancel",
      },
    ],
    submit: (result) => {
      if (result !== "cancel") {
        rollWeaponAttack(
          result.hopeDie,
          result.fearDie,
          result.advantage,
          result.disadvantage,
          result.modifier,
          weaponName,
          weaponTrait,
          weaponRange,
          damageFormula,
          damageType,
          weaponFeature,
          maxProficiency
        );
      }
    },
  }).render({ force: true });
})();

/**
 * Daggerheart Knowledge Roll Macro
 * For use with PDF-Pager label mapping
 * Maps to "Knowledge" label in character sheet
 */

function modifierNumberToExpression(modifier) {
  if (modifier === 0) return "";
  return modifier > 0 ? `+${modifier}` : `${modifier}`;
}

async function rollDaggerheart(
  hopeDieSize,
  fearDieSize,
  advantage,
  disadvantage,
  modifier,
  attributeName
) {
  // Build roll expression with labeled dice
  let rollExpression = `1${hopeDieSize}[Hope] + 1${fearDieSize}[Fear]`;

  // Add advantage/disadvantage dice
  let totalAdvantage = advantage - disadvantage;
  if (totalAdvantage !== 0) {
    rollExpression += ` ${totalAdvantage > 0 ? "+" : ""} ${totalAdvantage}d6kh`;
  }

  // Add modifier
  if (modifier !== 0) {
    rollExpression += ` ${modifierNumberToExpression(modifier)}`;
  }

  console.log(`${attributeName} Roll Expression:`, rollExpression);

  // Execute the roll
  const roll = await new Roll(rollExpression).evaluate();

  // Get actual Hope and Fear die results (not max/min!)
  const hopeResult = roll.dice[0].total;
  const fearResult = roll.dice[1].total;

  // Determine outcome
  const isCrit = hopeResult === fearResult;
  const isHope = hopeResult > fearResult;
  const isFear = hopeResult < fearResult;

  // Style the dice for Dice So Nice
  if (roll.dice[0]) {
    roll.dice[0].options.appearance = {
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

  if (roll.dice[1]) {
    roll.dice[1].options.appearance = {
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
  if (roll.dice.length > 2) {
    const advDice = roll.dice.slice(2);
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
                ${attributeName.toUpperCase()} - ${resultBanner}
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
            
            <div style="text-align: center; font-size: 16px; font-weight: bold; color: ${
              resultColor === "#DAA520" ? "#B8860B" : resultColor
            }; margin-top: 15px;">
                ${resultEffect}
            </div>
        </div>
    `;

  // Send to chat
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: enhancedFlavor,
    rollMode: game.settings.get("core", "rollMode"),
  });
}

// Main execution
(async () => {
  // Get the knowledge modifier from the PDF field
  let defaultModifier = 0;
  if (actor) {
    const knowledgeText = ui.pdfpager.getPDFValue(actor, "doc_0_Knowledge Value");
    if (knowledgeText) {
      // Parse the modifier (handles "+2", "-1", "0", etc.)
      const cleanText = knowledgeText.toString().replace(/^\+/, '');
      defaultModifier = parseInt(cleanText) || 0;
    }
  }

  // Launch the enhanced UI dialog
  new foundry.applications.api.DialogV2({
    window: {
      title: "🎲 Knowledge Roll 🎲",
      width: 900,
      height: "auto",
      resizable: true,
    },
    content: `
        <style>
            .dh-container {
                padding: 40px;
                background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                border-radius: 20px;
                color: #ecf0f1;
                box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
                border: 2px solid #34495e;
                min-width: 850px;
                max-width: 100%;
            }
            .dh-title {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 35px;
                background: linear-gradient(45deg, #f1c40f, #e67e22, #3b82f6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 20px rgba(241, 196, 15, 0.3);
                letter-spacing: 2px;
            }
            .dh-row {
                display: flex;
                align-items: center;
                justify-content: space-evenly;
                margin: 25px 0;
                gap: 30px;
            }
            .dh-col {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
                flex: 1;
            }
            .dh-dice-section {
                background: rgba(255,255,255,0.08);
                border-radius: 20px;
                padding: 35px;
                box-shadow: 0 12px 24px rgba(0,0,0,0.4);
                border: 2px solid rgba(255,255,255,0.15);
                backdrop-filter: blur(15px);
                margin-bottom: 25px;
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
                border-radius: 20px;
                padding: 30px;
                border: 2px solid rgba(255,255,255,0.12);
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.3);
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
            .plus-symbol {
                font-size: 40px;
                font-weight: bold;
                color: #ecf0f1;
                text-shadow: 0 0 15px rgba(236, 240, 241, 0.8);
                margin: 0 20px;
            }
            .dice-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin: 15px 0;
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
            <div class="dh-title">⚔️ KNOWLEDGE DUALITY DICE ⚔️</div>
            
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
                        <span class="section-label">🎯 Knowledge Modifier</span>
                        <input name="modifier" class="modifier-input" type="number" step="1" value="${defaultModifier}" placeholder="±0">
                    </div>
                </div>
            </div>
        </div>
    `,
    buttons: [
      {
        action: "roll",
        label: "🎲 ROLL KNOWLEDGE DICE",
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
        rollDaggerheart(
          result.hopeDie,
          result.fearDie,
          result.advantage,
          result.disadvantage,
          result.modifier,
          "Knowledge"
        );
      }
    },
  }).render({ force: true });
})();
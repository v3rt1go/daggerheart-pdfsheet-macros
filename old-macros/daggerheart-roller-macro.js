function modifierNumberToExpression(modifier) {
  if (modifier === 0) {
    return "";
  }
  if (modifier > 0) {
    return `+${modifier}`;
  }
  return `${modifier}`;
}

// example input: d20, d12, 2, 1, -3
async function rollDaggerheart(
  hopeDieSize,
  fearDieSize,
  advantage,
  disadvantage,
  modifier
) {
  let rollExpression = `1${hopeDieSize}[Hope] + 1${fearDieSize}[Fear]`;

  let totalAdvantage = advantage - disadvantage;
  if (totalAdvantage !== 0) {
    rollExpression += ` ${totalAdvantage > 0 ? "+" : "-"} ${Math.abs(
      totalAdvantage
    )}d6kh`;
  }

  if (modifier !== 0) {
    rollExpression += ` ${modifierNumberToExpression(modifier)}`;
  }

  console.log(rollExpression);

  const roll = await new Roll(rollExpression).evaluate();
  const isCrit = roll.dice[0].total === roll.dice[1].total;
  const isHope = roll.dice[0].total > roll.dice[1].total;
  const isFear = roll.dice[0].total < roll.dice[1].total;

  roll.dice[0].options.appearance = {
    // Hope colors
    colorset: "custom",
    foreground: "#ffa200",
    background: "#33ff33",
    outline: "#000000",
    edge: "#ffa200",
    texture: "ice",
    material: "metal",
    font: "Eczar",
    system: "standard",
  };
  roll.dice[1].options.appearance = {
    // Fear colors
    colorset: "custom",
    foreground: "#ffa200", //color of the lettering
    background: "#770000", //color of the die
    outline: "#000000",
    edge: "#ffa200",
    texture: "marble",
    material: "metal",
    font: "Eczar",
    system: "standard",
  };

  // Style advantage/disadvantage dice if present
  if (roll.dice.length > 2) {
    const advDice = roll.dice.slice(2); // All extra dice, not ideal but works
    const isPositive = advantage - disadvantage > 0;

    for (const die of advDice) {
      die.options.appearance = {
        colorset: "custom",
        foreground: "#FFFFFF",
        background: isPositive ? "#2ecc71" : "#e74c3c", // Green for Advantage or Red for Disadvantage
        outline: isPositive ? "#145a32" : "#641e16",
        edge: isPositive ? "#145a32" : "#641e16",
        texture: "crystal",
        material: "metal",
        font: "Eczar",
        system: "standard",
      };
    }
  }

  console.log(roll.terms[0].results[0].result);
  await roll.toMessage({
    speaker: ChatMessage.implementation.getSpeaker({ actor: actor }),
    flavor:
      "<h2>" +
      roll.terms[0].results[0].result +
      " Hope, " +
      roll.terms[2].results[0].result +
      " Fear</h2><p>" +
      (isCrit
        ? "<b>Critical</b> success! <br>You gain a Hope and clear a Stress"
        : isHope
        ? "Rolled with <b>Hope</b>! <br>You gain a Hope"
        : isFear
        ? "Rolled with <b>Fear</b>! <br>The GM gains a Fear"
        : "") +
      "</p>",
  });
}

new foundry.applications.api.DialogV2({
  window: { title: "Roll them dice, choom!" },
  content: `
    <style>
        .basic-margins-padding {
            margin: 2px;
            padding: 2px;
        }
 
        .flex-row {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            align-content: center;
        }
 
        .flex-col {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            align-content: center;
        }
        
        .hope-text {
        	color: #fafad2;
            text-shadow: 
              0 0 5px #FFD700,
              0 0 10px #FFD700,
              0 0 20px #FFA500,
              0 0 30px #FFA500,
              0 0 40px #FF8C00;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .fear-text {
        	color: #cdf1f9;
  text-shadow: 
    0 0 4px #00BFFF,
    0 0 8px #1E90FF,
    0 0 12px #4169E1,
    0 0 20px #0000FF,
    2px 2px 4px #000000;
  font-weight: bold;
  margin-bottom: 8px;
        }
 
        .invisible-input {
            background: transparent;
            border: none;
            min-width: 30px;
            max-width: 2em;
            text-align: center;
 
            margin: 2px;
            padding: 2px;
        }
 
        .modifier-input {
            background: transparent;
            border: none;
            min-width: 30px;
            max-width: 10em;
            text-align: center;
        }
 
        .clicker-button {
            border-radius: 5px;
            padding: 0.25em;
        }
        .clicker-plus-button {
            clip-path: polygon(75% 0%,100% 50%,75% 100%,0% 100%,20% 50%,0% 0%);
        }
        .clicker-minus-button {
            clip-path: polygon(100% 0%, 80% 50%, 100% 100%, 25% 100%, 0% 50%, 25% 0%);
        }
 
        .dieSizeToggle {
            display: none;
        }
        .dieSizeToggle + label {
            background-color: rgb(126, 123, 126);
            color: #e7d1b1;
 
            -webkit-box-shadow: inset 0 1px 6px rgba(41, 41, 41, 0.2),0 1px 2px rgba(0,0,0,0.05);
            -moz-box-shadow: inset 0 1px 6px 0 rgba(41, 41, 41, 0.2),0 1px 2px rgba(0,0,0,0.05);
            box-shadow: inset 0 1px 6px rgba(41, 41, 41, 0.2),0 1px 2px rgba(0, 0, 0, 0.05);
            cursor: default;
            border-color: black;
 
            margin: 2px;
            padding: 2px;
        }
        .dieSizeToggle:checked + label {
            background-color: rgb(162, 32, 20);
            color: #ffffff;
 
            -webkit-box-shadow: inset 0 1px 6px rgba(41, 41, 41, 0.2),0 1px 2px rgba(0,0,0,0.05);
            -moz-box-shadow: inset 0 1px 6px 0 rgba(41, 41, 41, 0.2),0 1px 2px rgba(0,0,0,0.05);
            box-shadow: inset 0 1px 6px rgba(41, 41, 41, 0.2),0 1px 2px rgba(0, 0, 0, 0.05);
            cursor: default;
        }
    </style>
 
    <script>

        incrementTextFieldCallback = (function(textFieldName, value){
            console.log("should increment " + textFieldName + " by " + toString(value));
        });
    </script>
 
    <div class="flex-col">
        <span class="basic-margins-padding">Roll</span>
 
        <div class="flex-row">
        	<div class="flex-col">
            <span class="basic-margins-padding hope-text">Hope</span>
            <div class="flex-row">
                <input id="die-size-hope-d12"  class="dieSizeToggle" name="hopeDieSizeToggle" value="d12" type="radio" checked>
                <label for="die-size-hope-d12" class="dieSizeLabel">d12</label>
                <input id="die-size-hope-d20"  class="dieSizeToggle" name="hopeDieSizeToggle" value="d20" type="radio">
                <label for="die-size-hope-d20" class="dieSizeLabel">d20</label>
            </div>
            </div>
            
            <span class="basic-margins-padding">+</span>
            <div class="flex-col"><span class="basic-margins-padding fear-text">Fear</span>
            <div class="flex-row">
                <input id="die-size-fear-d12"  class="dieSizeToggle" name="fearDieSizeToggle" value="d12" type="radio" checked>
                <label for="die-size-fear-d12" class="dieSizeLabel">d12</label>
                <input id="die-size-fear-d20"  class="dieSizeToggle" name="fearDieSizeToggle" value="d20" type="radio">
                <label for="die-size-fear-d20" class="dieSizeLabel">d20</label>
            </div></div>
            
        </div>
 
        <div class="flex-row basic-margins-padding">
            <span class="basic-margins-padding">+</span>
 
            <!--<button id="adv-minus" class="clicker-button clicker-minus-button" onclick="incrementTextFieldCallback('advantage', -1)"></button>-->
            <input name="advantage" class="invisible-input" type="number" min="0" step="1">
            <!--<button id="adv-plus" class="clicker-button clicker-plus-button"/></button>-->
 
            <span class="basic-margins-padding">Advantage</span>
 
 
            <span class="basic-margins-padding">-</span>
 
            <!--<button id="dis-minus" class="clicker-button clicker-minus-button"></button>-->
            <input name="disadvantage" class="invisible-input" type="number" min="0" step="1">
            <!--<button id="dis-plus" class="clicker-button clicker-plus-button"/></button>-->
 
            <span class="basic-margins-padding">Disadvantage</span>
        </div>
 
        <input name="modifier" class="modifier-input" type="number" step="1" placeholder="modifier" style="margin: 5px;" autofocus>
    </div>
`,
  buttons: [
    {
      action: "roll",
      label: "Roll",
      default: true,
      callback: (event, button, dialog) => {
        return {
          hopeDieSize: button.form.elements.hopeDieSizeToggle.value,
          fearDieSize: button.form.elements.fearDieSizeToggle.value,
          advantage: button.form.elements.advantage.valueAsNumber,
          disadvantage: button.form.elements.disadvantage.valueAsNumber,
          modifier: button.form.elements.modifier.valueAsNumber,
          // rollType: button.form.elements.rollTypeToggle.value,
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
      console.log(result);
      rollDaggerheart(
        result.hopeDieSize,
        result.fearDieSize,
        isNaN(result.advantage) ? 0 : result.advantage,
        isNaN(result.disadvantage) ? 0 : result.disadvantage,
        isNaN(result.modifier) ? 0 : result.modifier
      );
    }
  },
}).render({ force: true });

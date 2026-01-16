/*
2026 Eitan Biletski
Licensed under Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)
You may modify and use this wallpaper freely for non-commercial purposes.
Attribution is appreciated but not required.
https://creativecommons.org/licenses/by-nc/4.0/
*/


let settings = {
    showAMPM: false,       // toggle AM/PM
    hourOnly: false,      // only show hour & OCLOCK on exact hours
    alwaysOClock: false   // highlight OCLOCK even on non-flat hours
};

const fontSizeMap = {
    0: 0.5,
    1: 0.8,
    2: 1,
    3: 1.2,
    4: 1.5,
    5: 2,
}

function livelyPropertyListener(name, val) {
    switch(name) {
        case "clockSize":
            let scale = fontSizeMap[val] || 1;
            document.documentElement.style.cssText = `--font-scale: ${scale};`;
            break;
        case "showAMPM":
            settings.showAMPM = val;
            break;
        case "hourOnly":
            settings.hourOnly = val;
            break;
        case "alwaysOClock":
            settings.alwaysOClock = val;
            break;
        case "bgColor":
            if(val) document.body.style.backgroundColor = val;
            break;
    }
    updateClock(); // refresh immediately
}



// --- GRID ---
const grid = [
  ["I","T","L","I","S","A","S","A","M","P","M"],
  ["A","C","Q","U","A","R","T","E","R","D","C"],
  ["T","W","E","N","T","Y","F","I","V","E","X"],
  ["H","A","L","F","S","T","E","N","F","T","O"],
  ["P","A","S","T","E","R","U","N","I","N","E"],
  ["O","N","E","S","I","X","T","H","R","E","E"],
  ["F","O","U","R","F","I","V","E","T","W","O"],
  ["E","I","G","H","T","E","L","E","V","E","N"],
  ["S","E","V","E","N","T","W","E","L","V","E"],
  ["T","E","N","S","O","'","C","L","O","C","K"]
];

// --- WORD MAP ---
const wordMap = {
  IT: [[0,0],[0,1]],
  IS: [[0,3],[0,4]],
  AM: [[0,7],[0,8]],
  PM: [[0,9],[0,10]],
  A: [[1,0]],
  QUARTER: [[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8]],
  TWENTY: [[2,0],[2,1],[2,2],[2,3],[2,4],[2,5]],
  FIVE: [[2,6],[2,7],[2,8],[2,9]],
  HALF: [[3,0],[3,1],[3,2],[3,3]],
  TEN: [[3,5],[3,6],[3,7]],
  PAST: [[4,0],[4,1],[4,2],[4,3]],
  TO: [[3,9],[3,10]],
  ONE: [[5,0],[5,1],[5,2]],
  TWO: [[6,8],[6,9],[6,10]],
  THREE: [[5,6],[5,7],[5,8],[5,9],[5,10]],
  FOUR: [[6,0],[6,1],[6,2],[6,3]],
  FIVE_H: [[6,4],[6,5],[6,6],[6,7]],
  SIX: [[5,3],[5,4],[5,5]],
  SEVEN: [[8,0],[8,1],[8,2],[8,3],[8,4]],
  EIGHT: [[7,0],[7,1],[7,2],[7,3],[7,4]],
  NINE: [[4,7],[4,8],[4,9],[4,10]],
  TEN_H: [[9,0],[9,1],[9,2]],
  ELEVEN: [[7,5],[7,6],[7,7],[7,8],[7,9],[7,10]],
  TWELVE: [[8,5],[8,6],[8,7],[8,8],[8,9],[8,10]],
  OCLOCK: [[9,4],[9,5],[9,6],[9,7],[9,8],[9,9],[9,10]]
};

// --- MINUTE WORDS ---
const minuteWords = {
  0: [],
  5: ["FIVE","PAST"],
  10: ["TEN","PAST"],
  15: ["A","QUARTER","PAST"],
  20: ["TWENTY","PAST"],
  25: ["TWENTY","FIVE","PAST"],
  30: ["HALF","PAST"],
  35: ["TWENTY","FIVE","TO"],
  40: ["TWENTY","TO"],
  45: ["A","QUARTER","TO"],
  50: ["TEN","TO"],
  55: ["FIVE","TO"]
};

// --- NUMBER TO WORD ---
function numberToWords(hour) {
  const map = {
    1:"ONE",2:"TWO",3:"THREE",4:"FOUR",5:"FIVE_H",6:"SIX",
    7:"SEVEN",8:"EIGHT",9:"NINE",10:"TEN_H",11:"ELEVEN",12:"TWELVE"
  };
  return map[hour % 12 || 12];
}

function formatTime(hour, minute) {
    const rounded = Math.round(minute / 5) * 5;
    let displayHour = hour;

    let result = ["IT","IS"];

    if (settings.hourOnly) {
        // Always show the hour word
        result.push(numberToWords(displayHour));
        // Always show OCLOCK when hourOnly is true
        if (!result.includes("OCLOCK")) result.push("OCLOCK");
    } else {
        // Regular behavior for minute words
        if (rounded <= 30) {
            result.push(...minuteWords[rounded], numberToWords(displayHour));
        } else {
            result.push(...minuteWords[rounded], numberToWords(displayHour + 1));
        }

        // Show OCLOCK if minutes == 0 or alwaysOClock is true
        if (rounded === 0 || settings.alwaysOClock) {
            if (!result.includes("OCLOCK")) result.push("OCLOCK");
        }
    }

    // AM/PM toggle
    if (settings.showAMPM) {
        result.push(hour >= 12 ? "PM" : "AM");
    }

    return result;
}


// --- RENDER CLOCK ---
function updateClock() {
    // Use real device time by default
    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();

    // Only override if debug input exists AND has a valid value
    const debugInput = document.getElementById("debugTime");
    if (debugInput && debugInput.value.trim().match(/^\d{4}$/)) {
        const val = debugInput.value.trim();
        hour = parseInt(val.slice(0,2), 10);
        minute = parseInt(val.slice(2,4), 10);
    }

    const words = formatTime(hour, minute);
    const active = new Set(words.flatMap(w => wordMap[w] || []).map(p => `${p[0]}-${p[1]}`));

    const timeDiv = document.getElementById("time");

    // Create grid letters if empty
    if (!timeDiv.hasChildNodes()) {
        grid.forEach((row,r) => {
            row.forEach((letter,c) => {
                const div = document.createElement("div");
                div.textContent = letter;
                div.className = active.has(`${r}-${c}`) ? "visible" : "invisible";
                timeDiv.appendChild(div);
            });
        });
    } else {
        const divs = timeDiv.children;
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                const div = divs[r * grid[r].length + c];
                const key = `${r}-${c}`;
                if (active.has(key)) {
                    div.classList.add("visible");
                    div.classList.remove("invisible");
                } else {
                    div.classList.remove("visible");
                    div.classList.add("invisible");
                }
            }
        }
    }
}



// --- INITIALIZE CLOCK ---
updateClock();
setInterval(updateClock,1000);


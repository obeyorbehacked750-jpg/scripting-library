// Base62 Encoding configuration for Null's Brawl URI scheme
const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function encodeBase62(uint8Array) {
    let value = 0n;
    for (const byte of uint8Array) {
        value = (value << 8n) | BigInt(byte);
    }
    if (value === 0n) return BASE62_ALPHABET[0];
    let result = "";
    while (value > 0n) {
        const remainder = Number(value % 62n);
        result = BASE62_ALPHABET[remainder] + result;
        value = value / 62n;
    }
    return result;
}

function encodePayload(payload) {
    const jsonString = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(jsonString);
    return encodeBase62(bytes);
}

// Default battle parameters with baseline offsets required by the client
const DEFAULT_BP = [
    -11, -11, -11, -11, -100, -100, 0, 0, 0, -100, 0, -20, 0, 0, 0, -3, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

function createFriendlyBattleUrl(scriptId) {
    // Replace YOUR_DOMAIN with the actual server hosting your script content
    const contentUrl = `https://scripting.donutquine.dev/api/scripts/${scriptId}/content`;
    
    const payload = {
        realm: "experiment:scripts",
        script: contentUrl,
        bp: DEFAULT_BP
    };

    const encodedParams = encodePayload(payload);
    return `nullsbrawl://createAndJoinRoom?roomname=params:v2:${encodedParams}&friendly=1&side=0`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadScripts();
});

async function loadScripts() {
    try {
        // Fixed file reference to match your JSON data file
        const response = await fetch('scripts_3.json');
        const scripts = await response.json();
        const grid = document.getElementById('scripts-grid');

        // Button to add a new script card
        grid.innerHTML = `
            <li>
                <button class="_addScriptCard_1vwra_16">
                    <svg width="36" height="36" aria-hidden="true"><use href="icons/plus.svg#icon"></use></svg>
                </button>
            </li>
        `;

        scripts.forEach(script => {
            const li = document.createElement('li');
            
            // Construct Null's Brawl deep link using Base62 encoding
            const battleLink = createFriendlyBattleUrl(script.id);
            
            li.innerHTML = `
                <article class="_ScriptCard_1dbt9_5 custom-cursor-on-hover">
                    <header class="_ScriptCard__header_1dbt9_42">
                        <a class="_ScriptCard__title_1dbt9_56" href="#"><h3>${script.title}</h3></a>
                        <span class="_ScriptCard__badge_1dbt9_90">Health: ${script.health}</span>
                    </header>
                    
                    ${script.description ? `<p class="_ScriptCard__description_1dbt9_71">${script.description}</p>` : ''}
                    
                    <footer class="_ScriptCard__footer_1dbt9_51">
                        <a href="#">${script.author}</a>
                        <span class="_ScriptCard__date_1dbt9_86">${script.date}</span>
                    </footer>
                    
                    <div class="_ScriptCard__buttons_1dbt9_34">
                        <a href="${battleLink}" class="_btn_2swea_1 _btnPrimary_2swea_12 _startBattleBtn">
                            Start friendly battle
                        </a>
                    </div>
                </article>
            `;
            grid.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading scripts_3.json:", error);
    }
}
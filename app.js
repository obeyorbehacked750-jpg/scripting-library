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

// Default battle parameters required by client
const DEFAULT_BP = [
    -11, -11, -11, -11, -100, -100, 0, 0, 0, -100, 0, -20, 0, 0, 0, -3, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

function createFriendlyBattleUrl(scriptId) {
    const contentUrl = `https://scripting.donutquine.dev/api/scripts/${scriptId}/content`;
    
    const payload = {
        realm: "experiment:scripts",
        script: contentUrl,
        bp: DEFAULT_BP
    };

    const encodedParams = encodePayload(payload);
    return `nullsbrawl://createAndJoinRoom?roomname=params:v2:${encodedParams}&friendly=1&side=0`;
}

// Global state for scripts
let globalScripts = [];

document.addEventListener('DOMContentLoaded', () => {
    loadScripts();
    setupModalEvents();
});

async function loadScripts() {
    try {
        const localSaved = localStorage.getItem('nb_custom_scripts');
        if (localSaved) {
            globalScripts = JSON.parse(localSaved);
        } else {
            // Fetch from JSON file with fallback
            const response = await fetch('scripts.json');
            globalScripts = await response.json();
            localStorage.setItem('nb_custom_scripts', JSON.stringify(globalScripts));
        }
    } catch (error) {
        console.warn("Error fetching scripts.json, loading defaults:", error);
        globalScripts = [
            {
                id: "01a03308-5749-732b-8612-4345a4e94224",
                title: "Neuron Network AI",
                description: "Actual Neuron Network inside Nulls Brawl. Used brawler as Starr nova",
                health: "100 HP",
                author: "ChipyDev",
                date: "22.09.2026"
            },
            {
                id: "18f921e4-39c2-48f1-a1e6-9b5a2b3d8c11",
                title: "Spawn Car",
                description: "This script spawns a car in middle of map",
                health: "250 HP",
                author: "ChipyDev",
                date: "25.09.2026"
            }
        ];
    }
    renderGrid();
}

function renderGrid() {
    const grid = document.getElementById('scripts-grid');
    grid.innerHTML = '';

    // Add Script Card Button
    const addLi = document.createElement('li');
    addLi.innerHTML = `
        <button class="_addScriptCard_1vwra_16" id="open-create-modal" title="Create new script card">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>
    `;
    grid.appendChild(addLi);

    // Render Script Cards
    globalScripts.forEach(script => {
        const li = document.createElement('li');
        const battleLink = createFriendlyBattleUrl(script.id);
        
        li.innerHTML = `
            <article class="_ScriptCard_1dbt9_5 custom-cursor-on-hover">
                <header class="_ScriptCard__header_1dbt9_42">
                    <a class="_ScriptCard__title_1dbt9_56" href="#"><h3>${escapeHtml(script.title)}</h3></a>
                    <span class="_ScriptCard__badge_1dbt9_90">Health: ${escapeHtml(script.health)}</span>
                </header>
                
                ${script.description ? `<p class="_ScriptCard__description_1dbt9_71">${escapeHtml(script.description)}</p>` : ''}
                
                <footer class="_ScriptCard__footer_1dbt9_51">
                    <a href="#">${escapeHtml(script.author)}</a>
                    <span class="_ScriptCard__date_1dbt9_86">${escapeHtml(script.date)}</span>
                </footer>
                
                <div class="_ScriptCard__buttons_1dbt9_34">
                    <button data-link="${battleLink}" class="_btn_2swea_1 _btnPrimary_2swea_42 _startBattleBtn">
                        Start friendly battle
                    </button>
                </div>
            </article>
        `;
        grid.appendChild(li);
    });

    // Event listeners for battle buttons
    document.querySelectorAll('._startBattleBtn').forEach(button => {
        button.addEventListener('click', (e) => {
            const link = e.currentTarget.getAttribute('data-link');
            handleStartBattle(link);
        });
    });

    // Re-bind modal opener
    document.getElementById('open-create-modal')?.addEventListener('click', openModal);
}

function handleStartBattle(link) {
    // Copy link to clipboard as fallback/convenience
    navigator.clipboard.writeText(link).catch(() => {});
    
    // Attempt launching deep link
    window.location.href = link;
    showToast("Opening Null's Brawl room & link copied!", "success");
}

function setupModalEvents() {
    const modal = document.getElementById('create-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('create-script-form');

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('script-title').value.trim();
        const description = document.getElementById('script-description').value.trim();
        const health = document.getElementById('script-health').value.trim();
        const author = document.getElementById('script-author').value.trim();

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

        const newScript = {
            id: generateUUID(),
            title,
            description,
            health,
            author,
            date: dateStr
        };

        globalScripts.unshift(newScript);
        localStorage.setItem('nb_custom_scripts', JSON.stringify(globalScripts));
        
        renderGrid();
        closeModal();
        form.reset();
        showToast("Friendly battle script created!", "success");
    });
}

function openModal() {
    document.getElementById('create-modal')?.classList.remove('_modalOverlay_1b912_hidden');
}

function closeModal() {
    document.getElementById('create-modal')?.classList.add('_modalOverlay_1b912_hidden');
}

function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `_toast_183x2_1 ${type === 'success' ? '_toastSuccess_183x2_25' : '_toastError_183x2_30'}`;
    toast.textContent = message;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

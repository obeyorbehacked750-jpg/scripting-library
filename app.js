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

const DEFAULT_BP = [
    0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 13, 0, 4, 0, 1, 1, 1, 2, 1, 0, 0, 0, 100, 0, 0, 1, 1, 1, 1, 20
];

function createFriendlyBattleUrl(scriptId) {
    const contentUrl = `https://scripting.donutquine.dev/api/scripts/${scriptId}/content`;
    const payload = { realm: "experiment:scripts", script: contentUrl, bp: DEFAULT_BP };
    const encodedParams = encodePayload(payload);
    return `nullsbrawl://createAndJoinRoom?roomname=params:v2:${encodedParams}&friendly=1&side=0`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadScripts();
    
    // Use Event Delegation for dynamically created buttons
    const grid = document.getElementById('scripts-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const button = e.target.closest('.start-battle-btn');
            if (button) {
                const link = button.getAttribute('data-link');
                if (link) handleStartBattle(link);
            }
        });
    }
});

async function loadScripts() {
    let scripts = [];
    try {
        const response = await fetch('scripts.json');
        scripts = await response.json();
    } catch (error) {
        console.warn("Error fetching scripts.json. Ensure it's hosted properly.");
        return;
    }
    renderGrid(scripts);
}

function renderGrid(scripts) {
    const grid = document.getElementById('scripts-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Ensure scripts is an array before trying to iterate
    if (!Array.isArray(scripts)) return;

    scripts.forEach(script => {
        const li = document.createElement('li');
        const battleLink = createFriendlyBattleUrl(script.id);
        
        li.innerHTML = `
            <article class="script-card">
                <div class="card-content">
                    <h3 class="card-title">${escapeHtml(script.title)}</h3>
                    ${script.description ? `<p class="card-desc">${escapeHtml(script.description)}</p>` : ''}
                    
                    <div class="card-meta">
                        <div class="meta-item">
                            <!-- User Icon -->
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span>${escapeHtml(script.author)}</span>
                        </div>
                        <div class="meta-item">
                            <!-- Calendar Icon -->
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>${escapeHtml(script.date)}</span>
                        </div>
                    </div>
                </div>
                
                <button data-link="${battleLink}" class="btn btn-primary start-battle-btn">
                    <!-- Play Icon -->
                    <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Start Battle
                </button>
            </article>
        `;
        grid.appendChild(li);
    });
}

// Make the function async to await the clipboard copy before launching the deep link
async function handleStartBattle(link) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(link);
        }
    } catch (err) {
        console.warn("Clipboard copy failed", err);
    }
    
    showToast("Opening Null's Brawl & link copied!");
    
    // Add a slight delay so the OS has time to process the deep link without interrupting the browser
    setTimeout(() => {
        window.location.href = link;
    }, 150);
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    toast.innerHTML = `
        <svg class="icon-toast" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Handle null/undefined values safely
function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

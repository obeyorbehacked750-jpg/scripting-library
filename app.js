document.addEventListener('DOMContentLoaded', () => {
    loadScripts();
    
    // Use Event Delegation for dynamically created buttons
    const grid = document.getElementById('scripts-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const button = e.target.closest('.open-script-btn');
            if (button) {
                const link = button.getAttribute('data-link');
                if (link) {
                    // Opens the script page in a new tab
                    window.open(link, '_blank'); 
                }
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
        // New direct URL mapping
        const scriptUrl = `https://scripting.nulls.gg/scripts/${script.id}`;
        
        li.innerHTML = `
            <article class="script-card">
                <div class="card-content">
                    <h3 class="card-title">${escapeHtml(script.title)}</h3>${script.description ? `<p class="card-desc">${escapeHtml(script.description)}</p>` : ''}
                    
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
                
                <!-- Updated Button -->
                <button data-link="${scriptUrl}" class="btn btn-primary open-script-btn">
                    <!-- Changed to an external link icon -->
                    <svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; margin-right:6px;">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Open
                </button>
            </article>
        `;
        grid.appendChild(li);
    });
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

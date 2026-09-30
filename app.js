let currentScripts = [];

const translations = {
    en: {
        pageTitle: "Available Scripts",
        openBtn: "Open",
        unavailableBtn: "Unavailable"
    },
    ru: {
        pageTitle: "Доступные скрипты",
        openBtn: "Открыть",
        unavailableBtn: "Недоступно"
    }
};

function getLanguage() {
    return window.location.hash === '#en' ? 'en' : 'ru';
}

function applyTranslations() {
    const lang = getLanguage();
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = translations[lang].pageTitle;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    loadScripts();
    
    window.addEventListener('hashchange', () => {
        applyTranslations();
        renderGrid(currentScripts);
    });
    
    const grid = document.getElementById('scripts-grid');
    const modal = document.getElementById('iframe-modal');
    const iframe = document.getElementById('script-iframe');
    const closeModalBtn = document.getElementById('close-modal');

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => { if (iframe) iframe.src = ''; }, 300);
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (grid) {
        grid.addEventListener('click', (e) => {
            const button = e.target.closest('.open-script-btn');
            
            if (button && !button.disabled) {
                e.preventDefault();
                
                const link = button.getAttribute('data-link');
                if (link && iframe && modal) {
                    iframe.src = link;
                    modal.classList.add('show');
                }
            }
        });
    }
});

async function loadScripts() {
    try {
        const response = await fetch('scripts.json');
        currentScripts = await response.json();
        renderGrid(currentScripts);
    } catch (error) {
        console.warn("Error fetching scripts.json. Ensure it's hosted properly.");
    }
}

function renderGrid(scripts) {
    const grid = document.getElementById('scripts-grid');
    if (!grid || !Array.isArray(scripts)) return;
    
    grid.innerHTML = '';

    const sortedScripts = [...scripts].sort((a, b) => {
        const aUnavailable = !!a.unavailable;
        const bUnavailable = !!b.unavailable;
        return aUnavailable - bUnavailable;
    });

    const lang = getLanguage();
    const openText = translations[lang].openBtn;
    const unavailableText = translations[lang].unavailableBtn;

    sortedScripts.forEach(script => {
        const li = document.createElement('li');
        const scriptUrl = `https://scripting.nulls.gg/scripts/${script.id}`;
        const isUnavailable = !!script.unavailable;
        
        li.innerHTML = `
            <article class="script-card ${isUnavailable ? 'disabled-card' : ''}">
                <div class="card-content">
                    <h3 class="card-title">${escapeHtml(script.title)}</h3>
                    ${script.description ? `<p class="card-desc">${escapeHtml(script.description)}</p>` : ''}
                    
                    <div class="card-meta">
                        <div class="meta-item">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span>${escapeHtml(script.author)}</span>
                        </div>
                        <div class="meta-item">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>${escapeHtml(script.date)}</span>
                        </div>
                    </div>
                </div>
                
                <button data-link="${scriptUrl}" class="btn btn-primary open-script-btn" ${isUnavailable ? 'disabled' : ''}>
                    ${!isUnavailable ? `
                    <svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; margin-right:6px;">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    ${openText}` : unavailableText}
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

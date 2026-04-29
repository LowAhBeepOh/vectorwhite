/**
 * Vectorwhite - Basic Navigation Logic
 * Focus: Screen switching, theme toggling, and modal management.
 */

// --- Screen Management ---
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add('active');
    }
}

function goToHome() {
    location.href = 'index.html';
}

function createNewProject() {
    const presetSelect = document.getElementById('new-project-preset');
    const preset = presetSelect ? presetSelect.value : '16:9';
    localStorage.setItem('vectorwhite-preset', preset);
    location.href = 'editor.html';
}


// --- Theme Management ---
function setTheme(themeName) {
    // Remove all theme classes from body
    document.body.classList.remove('theme-dark', 'theme-deep', 'theme-light', 'theme-cream');
    
    // Add new theme class
    document.body.classList.add(`theme-${themeName}`);
    
    // Update active state in settings buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === themeName) {
            btn.classList.add('active');
        }
    });

    // Save preference (optional)
    localStorage.setItem('vectorwhite-theme', themeName);
}

// --- Modal Management ---
function getModalOverlay() {
    return document.getElementById('modal-overlay');
}

function openModal(modalId) {
    const modalOverlay = getModalOverlay();
    if (!modalOverlay) return;
    modalOverlay.classList.add('active');
    
    // Hide all modals first
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    
    // Show specific modal
    const targetModal = document.getElementById(`modal-${modalId}`);
    if (targetModal) {
        targetModal.style.display = 'block';
    }
}

function closeModals() {
    const modalOverlay = getModalOverlay();
    if (modalOverlay) modalOverlay.classList.remove('active');
}

function openSettings() {
    openModal('settings');
}

function openExportModal() {
    // Instead of modal, switch to Export subview in Editor
    showScreen('editor');
    switchSubview('export');
}

// --- Editor Subview Management ---
function switchSubview(subviewId) {
    // Hide all subviews
    document.querySelectorAll('.subview').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show target subview
    const target = document.getElementById(`subview-${subviewId}`);
    if (target) {
        target.classList.add('active');
    }

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-subview') === subviewId) {
            item.classList.add('active');
        }
    });
}


function openNewProjectModal() {
    openModal('new-project');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    const modalOverlay = getModalOverlay();
    if (modalOverlay && e.target === modalOverlay) {
        closeModals();
    }
});

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('vectorwhite-theme') || 'dark';
    setTheme(savedTheme);

    // Bottom Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const subview = item.getAttribute('data-subview');
                if (subview) {
                    switchSubview(subview);
                }
            });
        });
    }

    // Toolbar logic (Tool selection visual)
    const toolBtns = document.querySelectorAll('.tool-btn');
    if (toolBtns.length > 0) {
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // Burger menu dropdown
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuDropdown = document.querySelector('.menu-dropdown');
    if (menuTrigger && menuDropdown) {
        menuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('active');
        });
        document.addEventListener('click', () => {
            menuDropdown.classList.remove('active');
        });
    }

    // Responsive canvas sizing (true contain behavior)
    const canvasViewport = document.querySelector('.canvas-viewport');
    const canvasPaper = document.querySelector('.canvas-paper');
    if (canvasViewport && canvasPaper) {
        const PRESET_RATIOS = { '16:9': 16/9, '1:1': 1, '9:16': 9/16 };
        const resizeCanvas = () => {
            const preset = localStorage.getItem('vectorwhite-preset') || '16:9';
            const ratio = PRESET_RATIOS[preset] || 16/9;

            const availW = canvasViewport.clientWidth;
            const availH = canvasViewport.clientHeight;

            let w = availW;
            let h = w / ratio;

            if (h > availH) {
                h = availH;
                w = h * ratio;
            }

            canvasPaper.style.width = Math.max(0, w) + 'px';
            canvasPaper.style.height = Math.max(0, h) + 'px';
        };

        const ro = new ResizeObserver(resizeCanvas);
        ro.observe(canvasViewport);
        resizeCanvas();
    }

    // Sidebar Resizing Logic
    const initResizer = (resizerId, panelId, side) => {
        const resizer = document.getElementById(resizerId);
        const panel = document.getElementById(panelId);
        if (!resizer || !panel) return;

        let startX, startWidth;

        resizer.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startWidth = panel.offsetWidth;
            resizer.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            
            const onMouseMove = (e) => {
                let newWidth;
                if (side === 'left') {
                    newWidth = startWidth + (e.clientX - startX);
                } else {
                    newWidth = startWidth - (e.clientX - startX);
                }
                
                // Constraints are handled by CSS min/max-width but let's be explicit
                if (newWidth >= 160 && newWidth <= 480) {
                    panel.style.width = `${newWidth}px`;
                }
            };

            const onMouseUp = () => {
                resizer.classList.remove('dragging');
                document.body.style.cursor = 'default';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    initResizer('layers-resizer', 'layers-panel', 'left');
    initResizer('properties-resizer', 'properties-panel', 'right');

    // --- Assets Interactivity ---
    
    const categoryItems = document.querySelectorAll('.category-item');
    const assetsTitle = document.getElementById('assets-title');
    const assetsGrid = document.getElementById('assets-grid');

    const ASSETS_DATA = {
        characters: [
            { name: 'Character_Idle.svg' },
            { name: 'Hero_Walk.svg' },
            { name: 'Villain_Pose.png' },
            { name: 'NPC_Generic.svg' }
        ],
        backgrounds: [
            { name: 'Forest_Day.jpg' },
            { name: 'City_Night.png' },
            { name: 'Interior_Room.svg' }
        ],
        props: [
            { name: 'Sword_Bronze.svg' },
            { name: 'Healing_Potion.png' },
            { name: 'Wooden_Chest.svg' },
            { name: 'Key_Golden.svg' }
        ],
        audio: [
            { name: 'Background_Music.mp3' },
            { name: 'Jump_Effect.wav' },
            { name: 'Explosion.wav' }
        ]
    };

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            if (!category || !ASSETS_DATA[category]) return;

            // Update active state
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update title
            assetsTitle.textContent = item.querySelector('span:last-child').textContent;

            // Update grid content (Mock)
            assetsGrid.innerHTML = ASSETS_DATA[category].map(asset => `
                <div class="asset-card">
                    <div class="asset-preview"></div>
                    <div class="asset-info">
                        <span class="asset-name">${asset.name}</span>
                    </div>
                </div>
            `).join('');
        });
    });

    // --- Audio Mixer Interactivity ---
    
    // Mute/Solo button toggling
    const mixerBtns = document.querySelectorAll('.mixer-btn');
    mixerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });

    // Fader dragging logic
    const faderKnobs = document.querySelectorAll('.fader-knob');
    faderKnobs.forEach(knob => {
        knob.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const track = knob.parentElement;
            const trackRect = track.getBoundingClientRect();
            
            const onMouseMove = (moveEvent) => {
                let y = moveEvent.clientY - trackRect.top;
                y = Math.max(0, Math.min(y, trackRect.height));
                const percent = (y / trackRect.height) * 100;
                knob.style.top = `${percent}%`;
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });

    // Peak meter animation
    const meterFills = document.querySelectorAll('.meter-fill');
    if (meterFills.length > 0) {
        setInterval(() => {
            meterFills.forEach(fill => {
                // Random peak logic: target a value then smooth towards it
                const currentHeight = parseFloat(fill.style.height) || 0;
                let target = Math.random() * 80; // Peak up to 80%
                
                // If muted (check parent strip for mute active)
                const strip = fill.closest('.mixer-strip');
                const muteBtn = strip ? strip.querySelector('.mixer-btn.mute') : null;
                if (muteBtn && muteBtn.classList.contains('active')) {
                    target = 0;
                }

                const newHeight = currentHeight + (target - currentHeight) * 0.3;
                fill.style.height = `${newHeight}%`;
            });
        }, 100);
    }

    // --- Custom Dropdown Component ---
    const initCustomDropdown = (dropdownId) => {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const trigger = dropdown.querySelector('.dropdown-trigger');
        const valueSpan = dropdown.querySelector('.dropdown-value');
        const options = dropdown.querySelectorAll('.dropdown-option');

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        // Handle option selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Update active state
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update displayed value
                valueSpan.textContent = option.getAttribute('data-value');
                
                // Close dropdown
                dropdown.classList.remove('active');
                
                // Custom event for blend mode change
                dropdown.dispatchEvent(new CustomEvent('blendModeChange', {
                    detail: { value: option.getAttribute('data-value') }
                }));
            });
        });

        // Close on outside click
        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    };

    initCustomDropdown('blend-dropdown');
    initCustomDropdown('stroke-style-dropdown');
    initCustomDropdown('parent-dropdown');
});

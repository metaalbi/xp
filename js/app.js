(function () {
    const data = window.cvData || {};
    const desktop = document.getElementById('desktop');
    const startButton = document.getElementById('startButton');
    const startMenu = document.getElementById('startMenu');
    const startMenuItems = document.getElementById('startMenuItems');
    const startMenuName = document.getElementById('startMenuName');
    const startMenuRole = document.getElementById('startMenuRole');
    const startMenuAvatar = document.getElementById('startMenuAvatar');
    const taskbarButtons = document.getElementById('taskbarButtons');
    const trayClock = document.getElementById('trayClock');

    let activeWindowId = null;
    let zIndexCounter = 200;
    const windowsRegistry = new Map();

    function getInitials(name) {
        if (!name) return 'XP';
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((segment) => segment[0].toUpperCase())
            .join('');
    }

    function formatList(items = [], wrapper = 'p') {
        return items.map((item) => `<${wrapper}>${item}</${wrapper}>`).join('');
    }

    function renderSystemInfo(cv) {
        const focusAreas = (cv.profile?.focusAreas || []).map((area) => `• ${area}`).join('<br>');
        const applicationList = (cv.desktopIcons || []).map((icon) => `• ${icon.label}`).join('<br>');

        return `
            <h1>${cv.profile?.name || 'Your Name'} - ${cv.profile?.title || 'Role / Specialization'}</h1>
            <div class="section">
                <h2>System Information</h2>
                <p><strong>User:</strong> ${cv.profile?.name || 'Your Name'}</p>
                <p><strong>Location:</strong> ${cv.profile?.location || 'City, Country'}</p>
                <p><strong>Experience:</strong> ${cv.profile?.yearsExperience || 'Years of experience'}</p>
                <p><strong>Focus Areas:</strong><br>${focusAreas || 'Add key focus areas in js/cv-data.js'}</p>
                <p><strong>Availability:</strong> ${cv.profile?.availability || 'Open to new opportunities'}</p>
            </div>
            <div class="section">
                <h3>Available Applications</h3>
                <p>${applicationList || 'Desktop icons will appear here once configured.'}</p>
            </div>
        `;
    }

    function renderAbout(cv) {
        const summary = formatList(cv.profile?.summary || [
            'Update js/cv-data.js with your professional summary to show it here.'
        ]);

        const education = (cv.education || [])
            .map((item) => `
                <div class="education-item">
                    <div class="school">${item.school || 'Institution Name'}</div>
                    <div class="degree">${item.degree || 'Degree or certification'}</div>
                    <div class="location">${item.location || ''}</div>
                    <div class="date">${[item.start, item.end].filter(Boolean).join(' – ')}</div>
                </div>
            `)
            .join('');

        return `
            <h1>Professional Summary</h1>
            <div class="section">${summary}</div>
            <div class="section">
                <h2>Education</h2>
                ${education || '<p>Add your education history in js/cv-data.js.</p>'}
            </div>
        `;
    }

    function renderExperience(cv) {
        const experiences = (cv.experience || [])
            .map((job) => `
                <article class="experience-item">
                    <div class="company">${job.company || 'Company or Organization'}</div>
                    <div class="position">${job.role || 'Role / Job Title'}</div>
                    <div class="date">${[job.start, job.end].filter(Boolean).join(' – ')}${job.location ? ` | ${job.location}` : ''}</div>
                    <ul>
                        ${(job.achievements || ['Describe your accomplishments here.'])
                            .map((achievement) => `<li>${achievement}</li>`)
                            .join('')}
                    </ul>
                </article>
            `)
            .join('');

        return `
            <h1>Professional Experience</h1>
            ${experiences || '<p>Add roles and achievements in js/cv-data.js.</p>'}
        `;
    }

    function renderSkills(cv) {
        const categories = (cv.skills || [])
            .map((group) => `
                <div class="skill-category">
                    <h4>${group.category || 'Skill category'}</h4>
                    <p>${(group.items || []).join(', ') || 'Add bullet points to describe your skills.'}</p>
                </div>
            `)
            .join('');

        const languages = (cv.languages || [])
            .map((language) => `
                <span class="language-item">${language.name || 'Language'} — ${language.proficiency || 'Proficiency level'}</span>
            `)
            .join('');

        return `
            <h1>Technical Skills & Competencies</h1>
            <div class="skills-grid">${categories || '<p>Add your skills by category in js/cv-data.js.</p>'}</div>
            <div class="section">
                <h3>Languages</h3>
                <div class="language-list">${languages || 'List the languages you speak and proficiency levels.'}</div>
            </div>
        `;
    }

    function renderProjects(cv) {
        const projects = (cv.projects || [])
            .map((project) => `
                <article class="project-item">
                    <h3>${project.name || 'Project or Case Study'}</h3>
                    <p>${project.description || 'Describe the outcome, tech stack, and your contribution.'}</p>
                </article>
            `)
            .join('');

        return `
            <h1>Projects & Case Studies</h1>
            ${projects || '<p>Add projects and highlight measurable outcomes in js/cv-data.js.</p>'}
        `;
    }

    function renderContact(cv) {
        const contact = cv.contact || {};
        const padLine = (label, value) => `${(label || '').padEnd(14, ' ')}${value || ''}`;
        const lines = [
            '==========================================',
            '           CONTACT INFORMATION',
            '==========================================',
            '',
            padLine('Name:', cv.profile?.name || 'Your Name'),
            padLine('Role:', cv.profile?.title || 'Role / Specialization'),
            padLine('Email:', contact.email || 'you@email.com'),
            padLine('Phone:', contact.phone || 'Phone number'),
            padLine('LinkedIn:', contact.linkedin || 'https://linkedin.com/in/username'),
            padLine('Website:', contact.website || 'https://yourwebsite.com'),
            padLine('Location:', contact.location || cv.profile?.location || 'City, Country'),
            '',
            padLine('Availability:', contact.availability || cv.profile?.availability || 'Open to new opportunities'),
            '',
            '==========================================',
            '  Update js/cv-data.js to customize this.',
            '=========================================='
        ];

        return `
            <h1>Contact</h1>
            <div class="section contact-notepad" role="textbox" aria-label="Contact details">
${lines.map((line) => `                ${line}`).join('\n')}
            </div>
        `;
    }

    const windowDefinitions = [
        {
            id: 'window-my-computer',
            title: 'My Computer',
            iconClass: 'icon-my-computer',
            size: { width: 620, height: 420 },
            position: { left: 180, top: 120 },
            menu: ['File', 'Edit', 'View', 'Tools', 'Help'],
            render: renderSystemInfo
        },
        {
            id: 'window-about',
            title: 'About Me',
            iconClass: 'icon-folder',
            size: { width: 540, height: 460 },
            position: { left: 320, top: 100 },
            menu: ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'],
            render: renderAbout
        },
        {
            id: 'window-experience',
            title: 'Experience',
            iconClass: 'icon-folder',
            size: { width: 660, height: 520 },
            position: { left: 220, top: 60 },
            menu: ['File', 'Edit', 'View', 'Tools', 'Help'],
            render: renderExperience
        },
        {
            id: 'window-skills',
            title: 'Skills',
            iconClass: 'icon-folder',
            size: { width: 700, height: 520 },
            position: { left: 360, top: 140 },
            menu: ['File', 'Edit', 'View', 'Tools'],
            render: renderSkills
        },
        {
            id: 'window-projects',
            title: 'Projects',
            iconClass: 'icon-folder',
            size: { width: 640, height: 520 },
            position: { left: 420, top: 80 },
            menu: ['File', 'Edit', 'View', 'Favorites'],
            render: renderProjects
        },
        {
            id: 'window-contact',
            title: 'Contact.txt - Notepad',
            iconClass: 'icon-notepad',
            size: { width: 420, height: 360 },
            position: { left: 480, top: 180 },
            menu: ['File', 'Edit', 'Format', 'View', 'Help'],
            render: renderContact
        }
    ];

    function createWindow(definition) {
        const windowEl = document.createElement('section');
        windowEl.className = 'window hidden';
        windowEl.id = definition.id;
        windowEl.setAttribute('role', 'dialog');
        windowEl.setAttribute('aria-label', definition.title);
        windowEl.style.width = `${definition.size.width}px`;
        windowEl.style.height = `${definition.size.height}px`;
        windowEl.style.left = `${definition.position.left}px`;
        windowEl.style.top = `${definition.position.top}px`;

        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';
        const titleIcon = document.createElement('span');
        titleIcon.className = `title-icon ${definition.iconClass}`;
        const titleText = document.createElement('span');
        titleText.textContent = definition.title;
        titleBar.append(titleIcon, titleText);

        const controls = document.createElement('div');
        controls.className = 'window-controls';

        const minimizeButton = document.createElement('button');
        minimizeButton.className = 'control-button minimize';
        minimizeButton.type = 'button';
        minimizeButton.title = 'Minimize';
        minimizeButton.textContent = '_';

        const maximizeButton = document.createElement('button');
        maximizeButton.className = 'control-button maximize';
        maximizeButton.type = 'button';
        maximizeButton.title = 'Maximize';
        maximizeButton.textContent = '□';

        const closeButton = document.createElement('button');
        closeButton.className = 'control-button close';
        closeButton.type = 'button';
        closeButton.title = 'Close';
        closeButton.textContent = '×';

        controls.append(minimizeButton, maximizeButton, closeButton);
        titleBar.appendChild(controls);
        windowEl.appendChild(titleBar);

        if (definition.menu && definition.menu.length) {
            const menuBar = document.createElement('nav');
            menuBar.className = 'menu-bar';
            menuBar.setAttribute('aria-label', `${definition.title} menu`);
            definition.menu.forEach((item) => {
                const menuItem = document.createElement('span');
                menuItem.className = 'menu-item';
                menuItem.textContent = item;
                menuBar.appendChild(menuItem);
            });
            windowEl.appendChild(menuBar);
        }

        const content = document.createElement('div');
        content.className = 'window-content';
        content.innerHTML = definition.render(data);
        windowEl.appendChild(content);

        setupWindowInteractions(windowEl, {
            minimizeButton,
            maximizeButton,
            closeButton,
            titleBar,
            definition
        });

        desktop.appendChild(windowEl);
        windowsRegistry.set(definition.id, {
            element: windowEl,
            definition,
            taskbarButton: null,
            minimized: false,
            maximized: false,
            storedRect: null
        });
    }

    function setupWindowInteractions(windowEl, options) {
        const { minimizeButton, maximizeButton, closeButton, titleBar, definition } = options;

        windowEl.addEventListener('pointerdown', () => {
            focusWindow(definition.id);
            closeStartMenu();
        });

        minimizeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            minimizeWindow(definition.id);
        });

        maximizeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMaximize(definition.id);
        });

        closeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            closeWindow(definition.id);
        });

        enableDragging(windowEl, titleBar, definition.id);
    }

    function focusWindow(windowId) {
        const windowInfo = windowsRegistry.get(windowId);
        if (!windowInfo) return;

        zIndexCounter += 1;
        windowInfo.element.style.zIndex = zIndexCounter;

        windowsRegistry.forEach((info, id) => {
            const titleBar = info.element.querySelector('.title-bar');
            if (titleBar) {
                titleBar.classList.toggle('inactive', id !== windowId);
            }
            if (info.taskbarButton) {
                info.taskbarButton.classList.toggle('active', id === windowId && !info.element.classList.contains('hidden'));
            }
        });

        activeWindowId = windowId;
    }

    function openWindow(windowId) {
        const windowInfo = windowsRegistry.get(windowId);
        if (!windowInfo) return;

        windowInfo.element.classList.remove('hidden', 'minimized');
        focusWindow(windowId);
        ensureTaskbarButton(windowId);
    }

    function closeWindow(windowId) {
        const windowInfo = windowsRegistry.get(windowId);
        if (!windowInfo) return;

        windowInfo.element.classList.add('hidden');
        windowInfo.element.classList.remove('maximized');
        windowInfo.maximized = false;
        if (windowInfo.taskbarButton) {
            windowInfo.taskbarButton.remove();
            windowInfo.taskbarButton = null;
        }
        if (activeWindowId === windowId) {
            activeWindowId = null;
        }
    }

    function minimizeWindow(windowId) {
        const windowInfo = windowsRegistry.get(windowId);
        if (!windowInfo) return;

        windowInfo.element.classList.add('minimized');
        windowInfo.minimized = true;
        if (windowInfo.taskbarButton) {
            windowInfo.taskbarButton.classList.remove('active');
        }
        if (activeWindowId === windowId) {
            activeWindowId = null;
        }
    }

    function toggleMaximize(windowId) {
        const windowInfo = windowsRegistry.get(windowId);
        if (!windowInfo) return;

        const { element } = windowInfo;
        if (windowInfo.maximized) {
            element.classList.remove('maximized');
            if (windowInfo.storedRect) {
                const { left, top, width, height } = windowInfo.storedRect;
                element.style.left = `${left}px`;
                element.style.top = `${top}px`;
                element.style.width = `${width}px`;
                element.style.height = `${height}px`;
            }
            windowInfo.maximized = false;
        } else {
            windowInfo.storedRect = {
                left: element.offsetLeft,
                top: element.offsetTop,
                width: element.offsetWidth,
                height: element.offsetHeight
            };
            element.classList.add('maximized');
            windowInfo.maximized = true;
        }
        focusWindow(windowId);
    }

    function ensureTaskbarButton(windowId) {
        const windowInfo = windowsRegistry.get(windowId);
        if (!windowInfo) return;
        if (windowInfo.taskbarButton) {
            windowInfo.taskbarButton.classList.add('active');
            windowInfo.minimized = false;
            return;
        }

        const button = document.createElement('button');
        button.className = 'taskbar-button active';
        button.type = 'button';
        button.textContent = windowInfo.definition.title;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', windowId);

        button.addEventListener('click', () => {
            if (windowInfo.element.classList.contains('hidden') || windowInfo.minimized) {
                openWindow(windowId);
            } else if (activeWindowId === windowId) {
                minimizeWindow(windowId);
            } else {
                focusWindow(windowId);
            }
        });

        taskbarButtons.appendChild(button);
        windowInfo.taskbarButton = button;
    }

    function enableDragging(windowEl, titleBar, windowId) {
        let isDragging = false;
        let pointerId = null;
        let offsetX = 0;
        let offsetY = 0;

        titleBar.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) return;
            const windowInfo = windowsRegistry.get(windowId);
            if (windowInfo?.maximized) return;

            isDragging = true;
            pointerId = event.pointerId;
            offsetX = event.clientX - windowEl.offsetLeft;
            offsetY = event.clientY - windowEl.offsetTop;
            titleBar.setPointerCapture(pointerId);
        });

        titleBar.addEventListener('pointermove', (event) => {
            if (!isDragging || event.pointerId !== pointerId) return;
            const newLeft = event.clientX - offsetX;
            const newTop = event.clientY - offsetY;
            windowEl.style.left = `${Math.max(0, Math.min(newLeft, window.innerWidth - windowEl.offsetWidth))}px`;
            windowEl.style.top = `${Math.max(0, Math.min(newTop, window.innerHeight - 50))}px`;
        });

        function stopDragging(event) {
            if (!isDragging || event.pointerId !== pointerId) return;
            isDragging = false;
            titleBar.releasePointerCapture(pointerId);
        }

        titleBar.addEventListener('pointerup', stopDragging);
        titleBar.addEventListener('pointercancel', stopDragging);
    }

    function buildDesktopIcons() {
        let selectedIcon = null;
        const icons = data.desktopIcons || [];

        icons.forEach((iconData) => {
            const button = document.createElement('button');
            button.className = `desktop-icon`;
            button.type = 'button';
            button.dataset.window = iconData.id;
            button.style.top = `${iconData.position?.top ?? 20}px`;
            button.style.left = `${iconData.position?.left ?? 20}px`;

            const icon = document.createElement('span');
            icon.className = `icon-image ${iconData.icon}`;
            icon.setAttribute('aria-hidden', 'true');

            const label = document.createElement('span');
            label.textContent = iconData.label;

            button.append(icon, label);

            button.addEventListener('click', (event) => {
                event.stopPropagation();
                if (selectedIcon && selectedIcon !== button) {
                    selectedIcon.classList.remove('selected');
                }
                button.classList.toggle('selected');
                selectedIcon = button.classList.contains('selected') ? button : null;
            });

            button.addEventListener('dblclick', (event) => {
                event.stopPropagation();
                openWindow(iconData.id);
                button.classList.remove('selected');
                selectedIcon = null;
            });

            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    openWindow(iconData.id);
                }
            });

            desktop.appendChild(button);
        });

        desktop.addEventListener('click', () => {
            if (selectedIcon) {
                selectedIcon.classList.remove('selected');
                selectedIcon = null;
            }
        });
    }

    function buildStartMenu() {
        startMenuName.textContent = data.profile?.name || 'Your Name';
        startMenuRole.textContent = data.profile?.title || 'Role / Specialization';
        startMenuAvatar.textContent = data.profile?.avatarInitials || getInitials(data.profile?.name);

        startMenuItems.innerHTML = '';
        (data.desktopIcons || []).forEach((iconData) => {
            const item = document.createElement('div');
            item.className = `start-menu-item ${iconData.icon}`;
            item.dataset.window = iconData.id;
            item.textContent = iconData.label;
            item.setAttribute('role', 'menuitem');
            item.tabIndex = 0;

            item.addEventListener('click', () => {
                openWindow(iconData.id);
                closeStartMenu();
            });

            item.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openWindow(iconData.id);
                    closeStartMenu();
                }
            });

            startMenuItems.appendChild(item);
        });
    }

    function closeStartMenu() {
        startMenu.classList.remove('show');
        startMenu.setAttribute('aria-hidden', 'true');
        startButton.setAttribute('aria-pressed', 'false');
    }

    function toggleStartMenu() {
        const isOpen = startMenu.classList.toggle('show');
        startMenu.setAttribute('aria-hidden', String(!isOpen));
        startButton.setAttribute('aria-pressed', String(isOpen));
    }

    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        trayClock.textContent = `${hours}:${minutes}`;
    }

    function initialize() {
        buildDesktopIcons();
        buildStartMenu();
        windowDefinitions.forEach(createWindow);
        updateClock();
        setInterval(updateClock, 60000);
    }

    startButton.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleStartMenu();
    });

    document.addEventListener('click', (event) => {
        if (startMenu.classList.contains('show')) {
            const clickedInside = startMenu.contains(event.target) || startButton.contains(event.target);
            if (!clickedInside) {
                closeStartMenu();
            }
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeStartMenu();
        }
    });

    initialize();
})();

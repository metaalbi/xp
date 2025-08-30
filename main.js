document.addEventListener('DOMContentLoaded', () => {
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const startMenuItems = document.querySelectorAll('.start-menu-item');
  const windows = document.querySelectorAll('.window');
  const startButton = document.querySelector('.start-button');
  const startMenu = document.getElementById('startMenu');

  function focusWindow(win) {
    windows.forEach(w => w.classList.remove('active'));
    win.classList.add('active');
  }

  function toggleWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    if (win.classList.contains('hidden')) {
      win.classList.remove('hidden');
      focusWindow(win);
    } else if (win.classList.contains('active')) {
      win.classList.add('hidden');
      win.classList.remove('active');
    } else {
      focusWindow(win);
    }
  }

  desktopIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      toggleWindow(icon.dataset.window);
    });
  });

  startMenuItems.forEach(item => {
    item.addEventListener('click', () => {
      toggleWindow(item.dataset.window);
      if (startMenu) startMenu.classList.remove('show');
    });
  });

  document.querySelectorAll('.control-button.minimize').forEach(btn => {
    btn.addEventListener('click', e => {
      const win = e.target.closest('.window');
      win.classList.add('hidden');
      win.classList.remove('active');
    });
  });

  windows.forEach(win => {
    win.addEventListener('mousedown', () => focusWindow(win));
  });

  if (startButton && startMenu) {
    startButton.addEventListener('click', () => {
      startMenu.classList.toggle('show');
    });
  }

  document.addEventListener('click', e => {
    if (
      startMenu &&
      !startMenu.contains(e.target) &&
      (!startButton || !startButton.contains(e.target))
    ) {
      startMenu.classList.remove('show');
    }
  });
});


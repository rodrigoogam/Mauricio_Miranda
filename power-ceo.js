// =========================================================
// Sección "Power CEO": visor a pantalla completa para los prototipos.
// Al hacer clic en una imagen se abre en grande; se cierra con la ×,
// con la tecla Esc o haciendo clic fuera de la imagen.
// =========================================================

(function () {
  var buttons = document.querySelectorAll('.showcase__open');
  if (!buttons.length || typeof HTMLDialogElement === 'undefined') return;

  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.innerHTML = '<img alt=""><button type="button" class="lightbox__close" aria-label="Cerrar">×</button>';
  document.body.appendChild(dialog);

  var img = dialog.querySelector('img');
  var lastButton = null;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var thumb = btn.querySelector('img');
      img.src = btn.getAttribute('data-full');
      img.alt = thumb ? thumb.alt : '';
      lastButton = btn;
      dialog.showModal();
    });
  });

  function close() { dialog.close(); }
  dialog.querySelector('.lightbox__close').addEventListener('click', close);
  // Clic en el fondo oscuro (fuera de la imagen) cierra el visor
  dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
  dialog.addEventListener('close', function () { if (lastButton) lastButton.focus(); });
})();

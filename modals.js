function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
  } else {
    console.error(`⚠️ No se encontró el modal con id: ${id}`);
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
  } else {
    console.error(`⚠️ No se encontró el modal con id: ${id}`);
  }
}

export const showToast = (message, type = "info") => {
  const id = `toast-${Date.now()}`;
  const div = document.createElement("div");
  div.id = id;
  div.className = `px-4 py-2 rounded-md shadow text-sm text-white ${
    type === "success" ? "bg-green-600" :
    type === "error" ? "bg-red-600" : "bg-blue-600"
  }`;
  div.textContent = message;

  const container = document.getElementById("toast-container");
  if (container) container.appendChild(div);

  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
  }, 3000);
};

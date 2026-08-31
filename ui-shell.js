const TITLES = {
  transcript: "Live transcript",
  transcriber: "Service transcriber",
  mic: "Mic & recording test",
  feedback: "Report feedback",
  settings: "Settings",
  more: "More",
};

export function configureUIShell({
  getPreference,
  getPreferenceOptions,
  onPreference,
  onSheetClose = () => {},
  onSheetOpen = () => {},
}) {
  const app = document.querySelector("#app");
  const layer = document.querySelector("#sheetLayer");
  const sheet = document.querySelector("#sheet");
  const title = document.querySelector("#sheetTitle");
  const popover = document.querySelector("#popover");
  const popoverTitle = document.querySelector("#popoverTitle");
  const optionList = document.querySelector("#optionList");
  const toast = document.querySelector("#toast");
  let activeSheet = null;
  let toastTimer = null;

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1_800);
  }

  function closePopover() {
    popover.classList.remove("open");
    popover.setAttribute("aria-hidden", "true");
  }

  function updatePills() {
    for (const pill of document.querySelectorAll("[data-pref]")) pill.textContent = getPreference(pill.dataset.pref).label;
  }

  function openPopover(type) {
    const current = getPreference(type).value;
    const labels = { language: "Listening language", model: "Transcription model", pace: "Refresh rate", bible: "Bible version" };
    popoverTitle.textContent = labels[type];
    optionList.replaceChildren(...getPreferenceOptions(type).map((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.classList.toggle("active", option.value === current);
      button.dataset.value = option.value;
      button.innerHTML = `<span>${option.label}</span><span class="check" aria-hidden="true">✓</span>`;
      button.addEventListener("click", () => {
        onPreference(type, option.value);
        closePopover();
        updatePills();
      });
      return button;
    }));
    popover.classList.add("open");
    popover.setAttribute("aria-hidden", "false");
  }

  function openSheet(name) {
    closePopover();
    activeSheet = name;
    title.textContent = TITLES[name] ?? "Verse Listener";
    sheet.classList.toggle("transcript-sheet", name === "transcript");
    for (const panel of document.querySelectorAll("[data-sheet-panel]")) panel.hidden = panel.dataset.sheetPanel !== name;
    document.querySelector("#reportTranscriptButton").hidden = name !== "transcript";
    document.querySelector("#toggleTranscriptPlayback").hidden = name !== "transcript";
    document.querySelector("#sheetFeedbackActions").hidden = name !== "feedback";
    layer.classList.add("open");
    layer.setAttribute("aria-hidden", "false");
    onSheetOpen(name);
  }

  function closeSheet() {
    if (!activeSheet) return;
    const closing = activeSheet;
    activeSheet = null;
    layer.classList.remove("open");
    layer.setAttribute("aria-hidden", "true");
    onSheetClose(closing);
  }

  document.querySelector("#settingsBtn").addEventListener("click", () => openSheet("settings"));
  document.querySelector("#moreBtn").addEventListener("click", () => openSheet("more"));
  document.querySelector("#sheetClose").addEventListener("click", closeSheet);
  document.querySelector("#popoverClose").addEventListener("click", closePopover);
  document.querySelector("#peekBtn").addEventListener("click", () => openSheet("transcript"));
  for (const button of document.querySelectorAll("[data-sheet]")) button.addEventListener("click", () => openSheet(button.dataset.sheet));
  for (const button of document.querySelectorAll("[data-pref]")) button.addEventListener("click", (event) => {
    event.stopPropagation();
    openPopover(button.dataset.pref);
  });
  layer.addEventListener("click", (event) => { if (event.target === layer) closeSheet(); });
  document.addEventListener("click", (event) => {
    if (popover.classList.contains("open") && !popover.contains(event.target) && !event.target.closest("[data-pref]")) closePopover();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePopover();
      closeSheet();
    }
  });

  updatePills();
  return {
    app,
    closeSheet,
    get activeSheet() { return activeSheet; },
    openSheet,
    pulseDetected() {
      app.classList.remove("detected");
      requestAnimationFrame(() => app.classList.add("detected"));
      window.setTimeout(() => app.classList.remove("detected"), 1_450);
    },
    showToast,
    updatePills,
  };
}

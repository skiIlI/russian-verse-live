function optionMarkup(option, current) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "select-option";
  button.dataset.value = option.value;
  button.textContent = option.textContent;
  button.classList.toggle("active", option.value === current);
  button.setAttribute("role", "option");
  button.setAttribute("aria-selected", String(option.value === current));
  return button;
}

export function configureSelectControls(root = document) {
  const controls = new Map();

  function closeAll(except = null) {
    for (const control of controls.values()) {
      if (control.root !== except) {
        control.root.classList.remove("open");
        control.trigger.setAttribute("aria-expanded", "false");
      }
    }
  }

  function configure(controlRoot) {
    const select = root.querySelector(`#${controlRoot.dataset.selectFor}`);
    const trigger = controlRoot.querySelector(".select-trigger");
    const menu = controlRoot.querySelector(".select-menu");
    if (!select || !trigger || !menu) return null;

    const control = {
      root: controlRoot,
      select,
      trigger,
      menu,
      refresh() {
        const selected = select.selectedOptions[0];
        trigger.querySelector("span").textContent = selected?.textContent ?? "Choose";
        trigger.disabled = select.disabled;
        trigger.setAttribute("aria-disabled", String(select.disabled));
        menu.replaceChildren(...[...select.options].map((option) => optionMarkup(option, select.value)));
        for (const option of menu.querySelectorAll(".select-option")) {
          option.addEventListener("click", (event) => {
            event.stopPropagation();
            select.value = option.dataset.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            control.refresh();
            closeAll();
          });
        }
      },
    };

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const opening = !controlRoot.classList.contains("open");
      closeAll(opening ? controlRoot : null);
      controlRoot.classList.toggle("open", opening);
      trigger.setAttribute("aria-expanded", String(opening));
    });
    select.addEventListener("change", () => control.refresh());
    control.refresh();
    controls.set(select.id, control);
    return control;
  }

  for (const control of root.querySelectorAll("[data-select-for]")) configure(control);
  root.addEventListener("click", (event) => {
    if (!event.target.closest(".select-control")) closeAll();
  });

  return {
    closeAll,
    refresh(id) { controls.get(id)?.refresh(); },
    refreshAll() { for (const control of controls.values()) control.refresh(); },
  };
}

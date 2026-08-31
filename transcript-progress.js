export function configureTranscriptProgress(container, progress) {
  const fill = progress.querySelector("i");
  let activeRunId = null;

  function update(detail = null) {
    if (detail?.phase !== "transcribing") {
      activeRunId = null;
      container.hidden = true;
      progress.removeAttribute("data-running");
      progress.removeAttribute("aria-valuenow");
      return;
    }
    if (!container.hidden && activeRunId === detail.runId) return;
    activeRunId = detail.runId;
    container.hidden = false;
    progress.removeAttribute("data-running");
    fill.getBoundingClientRect();
    progress.setAttribute("data-running", "");
  }

  return { update };
}

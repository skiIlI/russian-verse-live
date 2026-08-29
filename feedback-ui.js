import {
  createCodexReportFile,
  deleteFeedbackReport,
  downloadFile,
  githubIssueUrl,
  listFeedbackReports,
  saveFeedbackReport,
} from "./feedback-store.js?v=3";

export function configureFeedbackUI({ elements, createReport, readPreview }) {
  function reportTitle(report) {
    const kind = report.kind === "missed" ? "Missed verse" : report.kind === "wrong" ? "Wrong verse" : "Detector feedback";
    return `${kind} · ${report.language.toUpperCase()}`;
  }

  function actionButton(label, action, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-button ${className}`.trim();
    button.textContent = label;
    button.addEventListener("click", action);
    return button;
  }

  async function exportReport(report) {
    downloadFile(await createCodexReportFile(report));
  }

  async function sendReport(report) {
    const issueWindow = window.open("about:blank", "_blank");
    if (issueWindow) issueWindow.opener = null;
    downloadFile(await createCodexReportFile(report));
    const url = githubIssueUrl(report);
    if (issueWindow) issueWindow.location.href = url;
    else window.location.href = url;
  }

  async function removeReport(report) {
    if (!window.confirm("Delete this saved feedback report from this device?")) return;
    await deleteFeedbackReport(report.id);
    await refresh();
  }

  async function refresh() {
    elements.reportsList.replaceChildren();
    let reports = [];
    try { reports = await listFeedbackReports(); } catch {}
    elements.reportsCount.textContent = String(reports.length);
    if (reports.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-line";
      empty.textContent = "No saved reports.";
      elements.reportsList.append(empty);
      return;
    }
    for (const report of reports) {
      const row = document.createElement("div");
      row.className = "report-row";
      const copy = document.createElement("div");
      copy.className = "report-row-copy";
      const title = document.createElement("strong");
      title.textContent = reportTitle(report);
      const detail = document.createElement("span");
      detail.textContent = `${new Date(report.createdAt).toLocaleString()} · ${report.actualAudioSeconds.toFixed(1)}s audio`;
      copy.append(title, detail);
      const actions = document.createElement("div");
      actions.className = "report-row-actions";
      actions.append(
        actionButton("Send", () => void sendReport(report)),
        actionButton("File", () => void exportReport(report)),
        actionButton("×", () => void removeReport(report), "delete"),
      );
      row.append(copy, actions);
      elements.reportsList.append(row);
    }
  }

  function open() {
    const preview = readPreview();
    elements.feedbackCaught.value = preview.caught ?? "";
    elements.feedbackTranscriptPreview.textContent = preview.transcript || "No transcript captured yet.";
    elements.feedbackStatus.textContent = preview.audioSeconds
      ? `${preview.audioSeconds.toFixed(1)} seconds of recent audio available.`
      : "No microphone audio is available yet; the text report can still be saved.";
    elements.feedbackDialog.showModal();
  }

  async function submit(event) {
    event.preventDefault();
    const wantsSend = event.submitter?.value === "send";
    const issueWindow = wantsSend ? window.open("about:blank", "_blank") : null;
    if (issueWindow) issueWindow.opener = null;
    elements.feedbackStatus.textContent = "Saving report…";
    try {
      const report = await createReport({
        kind: elements.feedbackKind.value,
        expected: elements.feedbackExpected.value.trim(),
        caught: elements.feedbackCaught.value.trim(),
        note: elements.feedbackNote.value.trim(),
        requestedAudioSeconds: Number(elements.feedbackDuration.value),
      });
      await saveFeedbackReport(report);
      await refresh();
      if (wantsSend) {
        downloadFile(await createCodexReportFile(report));
        const url = githubIssueUrl(report);
        if (issueWindow) issueWindow.location.href = url;
        else window.location.href = url;
        elements.feedbackStatus.textContent = "Attach the downloaded JSON file to the GitHub issue, then submit it.";
      } else {
        if (issueWindow) issueWindow.close();
        elements.feedbackStatus.textContent = "Saved on this device.";
      }
    } catch {
      if (issueWindow) issueWindow.close();
      elements.feedbackStatus.textContent = "The report could not be saved. Try again.";
    }
  }

  elements.reportFeedbackButton.addEventListener("click", open);
  elements.closeFeedbackButton.addEventListener("click", () => elements.feedbackDialog.close());
  elements.feedbackForm.addEventListener("submit", (event) => void submit(event));
  return { open, refresh };
}

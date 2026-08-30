import { downloadCurrentSourceContext } from "./source-context.js?v=6";

export function configureMoreMenu(elements) {
  let installPrompt = null;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  elements.installInstructions.textContent = isIOS
    ? "In Safari, tap Share, then Add to Home Screen. The installed app follows website updates."
    : "Install this listener as a full-screen browser app. It follows website updates.";
  if (isStandalone) elements.nativeInstallButton.hidden = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    elements.nativeInstallButton.hidden = false;
  });

  elements.nativeInstallButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    elements.nativeInstallButton.hidden = true;
  });

  elements.downloadSourceButton.addEventListener("click", async () => {
    elements.downloadSourceButton.disabled = true;
    try {
      await downloadCurrentSourceContext((index, total, path) => {
        elements.sourceDownloadStatus.textContent = `Fetching ${index}/${total} · ${path}`;
      });
      elements.sourceDownloadStatus.textContent = "Current GitHub source context downloaded.";
    } catch {
      elements.sourceDownloadStatus.textContent = "Could not reach GitHub. Check the connection and try again.";
    } finally {
      elements.downloadSourceButton.disabled = false;
    }
  });
}

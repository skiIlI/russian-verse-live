const BIBLE_VERSIONS = {
  ru: [{ value: "synodal", label: "Russian Synodal" }],
  en: [
    { value: "nasb", label: "NASB · Default" },
    { value: "nkjv", label: "NKJV" },
    { value: "esv", label: "ESV" },
    { value: "niv", label: "NIV" },
  ],
};

export function restoreWhisperPace(select, storage) {
  const saved = storage.getItem("verse-whisper-interval-ms-v2");
  select.value = ["1000", "1500", "2000"].includes(saved) ? saved : "1000";
}

export function populateBibleVersions(select, note, language, storage) {
  const storageKey = `verse-bible-version-${language}`;
  const options = BIBLE_VERSIONS[language];
  const saved = storage.getItem(storageKey);
  select.replaceChildren(...options.map(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }));
  select.value = options.some(({ value }) => value === saved) ? saved : options[0].value;
  note.textContent = language === "en"
    ? "Reference detection works across versions; NASB is the default preference."
    : "Russian listening uses the Synodal version profile.";
}

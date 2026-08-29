const DATABASE_NAME = "verse-listener-feedback";
const STORE_NAME = "reports";
const DATABASE_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function transact(mode, operation) {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function saveFeedbackReport(report) {
  await transact("readwrite", (store) => store.put(report));
  return report;
}

export async function listFeedbackReports() {
  const reports = await transact("readonly", (store) => store.getAll());
  return reports.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function deleteFeedbackReport(id) {
  await transact("readwrite", (store) => store.delete(id));
}

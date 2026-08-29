const CONTEXT_TTL_MS = 6 * 60 * 60 * 1e3;
const DUPLICATE_TTL_MS = 20 * 1e3;
const BOOKS = [
  { id: "genesis", book: "\u0411\u044B\u0442\u0438\u0435", canonicalBook: "Genesis", aliases: ["\u0431\u044B\u0442\u0438\u0435", "\u0431\u044B\u0442\u0438\u044F", "\u0431\u0442\u0435"] },
  { id: "exodus", book: "\u0418\u0441\u0445\u043E\u0434", canonicalBook: "Exodus", aliases: ["\u0438\u0441\u0445\u043E\u0434"] },
  { id: "leviticus", book: "\u041B\u0435\u0432\u0438\u0442", canonicalBook: "Leviticus", aliases: ["\u043B\u0435\u0432\u0438\u0442", "\u043B\u0435\u0432\u0438\u0442\u0430"] },
  { id: "numbers", book: "\u0427\u0438\u0441\u043B\u0430", canonicalBook: "Numbers", aliases: ["\u0447\u0438\u0441\u043B\u0430", "\u0447\u0438\u0441\u0435\u043B"] },
  { id: "deuteronomy", book: "\u0412\u0442\u043E\u0440\u043E\u0437\u0430\u043A\u043E\u043D\u0438\u0435", canonicalBook: "Deuteronomy", aliases: ["\u0432\u0442\u043E\u0440\u043E\u0437\u0430\u043A\u043E\u043D\u0438\u0435", "\u0432\u0442\u043E\u0440\u043E\u0437\u0430\u043A\u043E\u043D\u0438\u044F"] },
  { id: "joshua", book: "\u0418\u0438\u0441\u0443\u0441 \u041D\u0430\u0432\u0438\u043D", canonicalBook: "Joshua", aliases: ["\u0438\u0438\u0441\u0443\u0441\u0430 \u043D\u0430\u0432\u0438\u043D\u0430", "\u0438\u0438\u0441\u0443\u0441 \u043D\u0430\u0432\u0438\u043D", "\u043D\u0430\u0432\u0438\u043D\u0430"] },
  { id: "judges", book: "\u0421\u0443\u0434\u044C\u0438", canonicalBook: "Judges", aliases: ["\u043A\u043D\u0438\u0433\u0430 \u0441\u0443\u0434\u0435\u0439", "\u0441\u0443\u0434\u0435\u0439", "\u0441\u0443\u0434\u044C\u0438"] },
  { id: "ruth", book: "\u0420\u0443\u0444\u044C", canonicalBook: "Ruth", aliases: ["\u0440\u0443\u0444\u044C", "\u0440\u0443\u0444\u0438"] },
  { id: "1-samuel", book: "1 \u0426\u0430\u0440\u0441\u0442\u0432", canonicalBook: "1 Samuel", aliases: ["\u043F\u0435\u0440\u0432\u0430\u044F \u0446\u0430\u0440\u0441\u0442\u0432", "\u043F\u0435\u0440\u0432\u043E\u0435 \u0446\u0430\u0440\u0441\u0442\u0432", "1 \u0446\u0430\u0440\u0441\u0442\u0432"] },
  { id: "2-samuel", book: "2 \u0426\u0430\u0440\u0441\u0442\u0432", canonicalBook: "2 Samuel", aliases: ["\u0432\u0442\u043E\u0440\u0430\u044F \u0446\u0430\u0440\u0441\u0442\u0432", "\u0432\u0442\u043E\u0440\u043E\u0435 \u0446\u0430\u0440\u0441\u0442\u0432", "2 \u0446\u0430\u0440\u0441\u0442\u0432"] },
  { id: "1-kings", book: "3 \u0426\u0430\u0440\u0441\u0442\u0432", canonicalBook: "1 Kings", aliases: ["\u0442\u0440\u0435\u0442\u044C\u044F \u0446\u0430\u0440\u0441\u0442\u0432", "\u0442\u0440\u0435\u0442\u044C\u0435 \u0446\u0430\u0440\u0441\u0442\u0432", "3 \u0446\u0430\u0440\u0441\u0442\u0432"] },
  { id: "2-kings", book: "4 \u0426\u0430\u0440\u0441\u0442\u0432", canonicalBook: "2 Kings", aliases: ["\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0430\u044F \u0446\u0430\u0440\u0441\u0442\u0432", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0435 \u0446\u0430\u0440\u0441\u0442\u0432", "4 \u0446\u0430\u0440\u0441\u0442\u0432"] },
  { id: "job", book: "\u0418\u043E\u0432", canonicalBook: "Job", aliases: ["\u0438\u043E\u0432\u0430", "\u0438\u043E\u0432"] },
  { id: "psalms", book: "\u041F\u0441\u0430\u043B\u043E\u043C", canonicalBook: "Psalms", aliases: ["\u043F\u0441\u0430\u043B\u0442\u0438\u0440\u044C", "\u043F\u0441\u0430\u043B\u0442\u044B\u0440\u044C", "\u043F\u0441\u0430\u043B\u043E\u043C", "\u043F\u0441\u0430\u043B\u043C\u0430", "\u043F\u0441\u0430\u043B\u043C\u0435", "\u043F\u0441\u0430\u043B\u043C\u044B", "\u043F\u0441\u0430\u043B\u043C\u043E\u0432", "\u043F\u0441\u0430\u043B\u043C\u0430\u0445"] },
  { id: "proverbs", book: "\u041F\u0440\u0438\u0442\u0447\u0438", canonicalBook: "Proverbs", aliases: ["\u043F\u0440\u0438\u0442\u0447\u0438", "\u043F\u0440\u0438\u0442\u0447\u0435\u0439"] },
  { id: "ecclesiastes", book: "\u0415\u043A\u043A\u043B\u0435\u0441\u0438\u0430\u0441\u0442", canonicalBook: "Ecclesiastes", aliases: ["\u0435\u043A\u043A\u043B\u0435\u0441\u0438\u0430\u0441\u0442\u0430", "\u0435\u043A\u043A\u043B\u0435\u0441\u0438\u0430\u0441\u0442", "\u044D\u043A\u043A\u043B\u0435\u0437\u0438\u0430\u0441\u0442"] },
  { id: "song", book: "\u041F\u0435\u0441\u043D\u044C \u041F\u0435\u0441\u043D\u0435\u0439", canonicalBook: "Song of Solomon", aliases: ["\u043F\u0435\u0441\u043D\u044C \u043F\u0435\u0441\u043D\u0435\u0439", "\u043F\u0435\u0441\u043D\u0438 \u043F\u0435\u0441\u043D\u0435\u0439"] },
  { id: "isaiah", book: "\u0418\u0441\u0430\u0438\u044F", canonicalBook: "Isaiah", aliases: ["\u0438\u0441\u0430\u0438\u0438", "\u0438\u0441\u0430\u0439\u044F", "\u0438\u0441\u0430\u0438\u044F"] },
  { id: "jeremiah", book: "\u0418\u0435\u0440\u0435\u043C\u0438\u044F", canonicalBook: "Jeremiah", aliases: ["\u0438\u0435\u0440\u0435\u043C\u0438\u0438", "\u0438\u0435\u0440\u0435\u043C\u0438\u044F"] },
  { id: "lamentations", book: "\u041F\u043B\u0430\u0447 \u0418\u0435\u0440\u0435\u043C\u0438\u0438", canonicalBook: "Lamentations", aliases: ["\u043F\u043B\u0430\u0447 \u0438\u0435\u0440\u0435\u043C\u0438\u0438"] },
  { id: "ezekiel", book: "\u0418\u0435\u0437\u0435\u043A\u0438\u0438\u043B\u044C", canonicalBook: "Ezekiel", aliases: ["\u0438\u0435\u0437\u0435\u043A\u0438\u0438\u043B\u044F", "\u0438\u0435\u0437\u0435\u043A\u0438\u0438\u043B\u044C"] },
  { id: "daniel", book: "\u0414\u0430\u043D\u0438\u0438\u043B", canonicalBook: "Daniel", aliases: ["\u0434\u0430\u043D\u0438\u0438\u043B\u0430", "\u0434\u0430\u043D\u0438\u0438\u043B"] },
  { id: "hosea", book: "\u041E\u0441\u0438\u044F", canonicalBook: "Hosea", aliases: ["\u043E\u0441\u0438\u0438", "\u043E\u0441\u0438\u044F"] },
  { id: "joel", book: "\u0418\u043E\u0438\u043B\u044C", canonicalBook: "Joel", aliases: ["\u0438\u043E\u0438\u043B\u044F", "\u0438\u043E\u0438\u043B\u044C"] },
  { id: "amos", book: "\u0410\u043C\u043E\u0441", canonicalBook: "Amos", aliases: ["\u0430\u043C\u043E\u0441\u0430", "\u0430\u043C\u043E\u0441"] },
  { id: "jonah", book: "\u0418\u043E\u043D\u0430", canonicalBook: "Jonah", aliases: ["\u0438\u043E\u043D\u044B", "\u0438\u043E\u043D\u0430"] },
  { id: "micah", book: "\u041C\u0438\u0445\u0435\u0439", canonicalBook: "Micah", aliases: ["\u043C\u0438\u0445\u0435\u044F", "\u043C\u0438\u0445\u0435\u0439"] },
  { id: "habakkuk", book: "\u0410\u0432\u0432\u0430\u043A\u0443\u043C", canonicalBook: "Habakkuk", aliases: ["\u0430\u0432\u0432\u0430\u043A\u0443\u043C\u0430", "\u0430\u0432\u0432\u0430\u043A\u0443\u043C"] },
  { id: "zechariah", book: "\u0417\u0430\u0445\u0430\u0440\u0438\u044F", canonicalBook: "Zechariah", aliases: ["\u0437\u0430\u0445\u0430\u0440\u0438\u0438", "\u0437\u0430\u0445\u0430\u0440\u0438\u044F"] },
  { id: "malachi", book: "\u041C\u0430\u043B\u0430\u0445\u0438\u044F", canonicalBook: "Malachi", aliases: ["\u043C\u0430\u043B\u0430\u0445\u0438\u0438", "\u043C\u0430\u043B\u0430\u0445\u0438\u044F"], verseOnlyChapter: 4 },
  { id: "matthew", book: "\u041E\u0442 \u041C\u0430\u0442\u0444\u0435\u044F", canonicalBook: "Matthew", aliases: ["\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u043C\u0430\u0442\u0444\u0435\u044F", "\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u043C\u0430\u0442\u0432\u0435\u044F", "\u043E\u0442 \u043C\u0430\u0442\u0444\u0435\u044F", "\u043E\u0442 \u043C\u0430\u0442\u0432\u0435\u044F", "\u043C\u0430\u0442\u0444\u0435\u044F", "\u043C\u0430\u0442\u0444\u0435\u044E", "\u043C\u0430\u0442\u0444\u0435\u0439", "\u043C\u0430\u0442\u0432\u0435\u044F", "\u043C\u0430\u0442\u0432\u0435\u044E", "\u043C\u0430\u0442\u0432\u0435\u0439", "\u043C\u0430\u0442\u0435\u044F"] },
  { id: "mark", book: "\u041E\u0442 \u041C\u0430\u0440\u043A\u0430", canonicalBook: "Mark", aliases: ["\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u043C\u0430\u0440\u043A\u0430", "\u043E\u0442 \u043C\u0430\u0440\u043A\u0430", "\u043C\u0430\u0440\u043A\u0430", "\u043C\u0430\u0440\u043A"] },
  { id: "luke", book: "\u041E\u0442 \u041B\u0443\u043A\u0438", canonicalBook: "Luke", aliases: ["\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u043B\u0443\u043A\u0438", "\u043E\u0442 \u043B\u0443\u043A\u0438", "\u043B\u0443\u043A\u043E\u0439", "\u043B\u0443\u043A\u0438", "\u043B\u0443\u043A\u0430"] },
  { id: "john", book: "\u041E\u0442 \u0418\u043E\u0430\u043D\u043D\u0430", canonicalBook: "John", aliases: ["\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u0438\u043E\u0430\u043D\u043D\u0430", "\u043E\u0442 \u0438\u043E\u0430\u043D\u043D\u0430", "\u0438\u043E\u0430\u043D\u043D\u0430", "\u0438\u043E\u0430\u043D\u043D"] },
  { id: "acts", book: "\u0414\u0435\u044F\u043D\u0438\u044F", canonicalBook: "Acts", aliases: ["\u0434\u0435\u044F\u043D\u0438\u044F \u0430\u043F\u043E\u0441\u0442\u043E\u043B\u043E\u0432", "\u0434\u0435\u044F\u043D\u0438\u0439", "\u0434\u0435\u044F\u043D\u0438\u044F"] },
  { id: "romans", book: "\u041A \u0420\u0438\u043C\u043B\u044F\u043D\u0430\u043C", canonicalBook: "Romans", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0440\u0438\u043C\u043B\u044F\u043D\u0430\u043C", "\u043A \u0440\u0438\u043C\u043B\u044F\u043D\u0430\u043C", "\u0440\u0438\u043C\u043B\u044F\u043D\u0430\u043C"] },
  { id: "1-corinthians", book: "1 \u041A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", canonicalBook: "1 Corinthians", aliases: ["\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u043F\u0435\u0440\u0432\u0430\u044F \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u043F\u0435\u0440\u0432\u044B\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u0438\u0430\u043D\u043E\u043C", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u0438\u0430\u043D\u0430\u043C", "1 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C"] },
  { id: "2-corinthians", book: "2 \u041A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", canonicalBook: "2 Corinthians", aliases: ["\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u0432\u0442\u043E\u0440\u043E\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u0432\u0442\u043E\u0440\u0430\u044F \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "2 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C"] },
  { id: "galatians", book: "\u041A \u0413\u0430\u043B\u0430\u0442\u0430\u043C", canonicalBook: "Galatians", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0433\u0430\u043B\u0430\u0442\u0430\u043C", "\u043A \u0433\u0430\u043B\u0430\u0442\u0430\u043C", "\u0433\u0430\u043B\u0430\u0442\u0430\u043C"] },
  { id: "ephesians", book: "\u041A \u0415\u0444\u0435\u0441\u044F\u043D\u0430\u043C", canonicalBook: "Ephesians", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0435\u0444\u0435\u0441\u044F\u043D\u0430\u043C", "\u043A \u0435\u0444\u0435\u0441\u044F\u043D\u0430\u043C", "\u0435\u0444\u0435\u0441\u044F\u043D\u0430\u043C"] },
  { id: "philippians", book: "\u041A \u0424\u0438\u043B\u0438\u043F\u043F\u0438\u0439\u0446\u0430\u043C", canonicalBook: "Philippians", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0444\u0438\u043B\u0438\u043F\u043F\u0438\u0439\u0446\u0430\u043C", "\u043A \u0444\u0438\u043B\u0438\u043F\u043F\u0438\u0439\u0446\u0430\u043C", "\u0444\u0438\u043B\u0438\u043F\u043F\u0438\u0439\u0446\u0430\u043C"] },
  { id: "colossians", book: "\u041A \u041A\u043E\u043B\u043E\u0441\u0441\u044F\u043D\u0430\u043C", canonicalBook: "Colossians", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u043A\u043E\u043B\u043E\u0441\u0441\u044F\u043D\u0430\u043C", "\u043A \u043A\u043E\u043B\u043E\u0441\u0441\u044F\u043D\u0430\u043C", "\u043A\u043E\u043B\u043E\u0441\u0441\u044F\u043D\u0430\u043C"] },
  { id: "1-thessalonians", book: "1 \u0424\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", canonicalBook: "1 Thessalonians", aliases: ["\u043F\u0435\u0440\u0432\u043E\u0435 \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", "1 \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C"] },
  { id: "2-thessalonians", book: "2 \u0424\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", canonicalBook: "2 Thessalonians", aliases: ["\u0432\u0442\u043E\u0440\u043E\u0435 \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", "2 \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C"] },
  { id: "1-timothy", book: "1 \u0422\u0438\u043C\u043E\u0444\u0435\u044E", canonicalBook: "1 Timothy", aliases: ["\u043F\u0435\u0440\u0432\u043E\u0435 \u0442\u0438\u043C\u043E\u0444\u0435\u044E", "1 \u0442\u0438\u043C\u043E\u0444\u0435\u044E"] },
  { id: "2-timothy", book: "2 \u0422\u0438\u043C\u043E\u0444\u0435\u044E", canonicalBook: "2 Timothy", aliases: ["\u0432\u0442\u043E\u0440\u043E\u0435 \u0442\u0438\u043C\u043E\u0444\u0435\u044E", "2 \u0442\u0438\u043C\u043E\u0444\u0435\u044E"] },
  { id: "titus", book: "\u041A \u0422\u0438\u0442\u0443", canonicalBook: "Titus", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0442\u0438\u0442\u0443", "\u043A \u0442\u0438\u0442\u0443", "\u0442\u0438\u0442\u0443"] },
  { id: "philemon", book: "\u041A \u0424\u0438\u043B\u0438\u043C\u043E\u043D\u0443", canonicalBook: "Philemon", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0444\u0438\u043B\u0438\u043C\u043E\u043D\u0443", "\u043A \u0444\u0438\u043B\u0438\u043C\u043E\u043D\u0443", "\u0444\u0438\u043B\u0438\u043C\u043E\u043D\u0443"] },
  { id: "hebrews", book: "\u041A \u0415\u0432\u0440\u0435\u044F\u043C", canonicalBook: "Hebrews", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0435\u0432\u0440\u0435\u044F\u043C", "\u043A \u0435\u0432\u0440\u0435\u044F\u043C", "\u0435\u0432\u0440\u0435\u044F\u043C"] },
  { id: "james", book: "\u0418\u0430\u043A\u043E\u0432\u0430", canonicalBook: "James", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u0430\u043A\u043E\u0432\u0430", "\u0438\u0430\u043A\u043E\u0432\u0430", "\u0438\u0430\u043A\u043E\u0432"] },
  { id: "1-peter", book: "1 \u041F\u0435\u0442\u0440\u0430", canonicalBook: "1 Peter", aliases: ["\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043F\u0435\u0442\u0440\u0430", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u0435\u0442\u0440\u0430", "1 \u043F\u0435\u0442\u0440\u0430"] },
  { id: "2-peter", book: "2 \u041F\u0435\u0442\u0440\u0430", canonicalBook: "2 Peter", aliases: ["\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043F\u0435\u0442\u0440\u0430", "\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u0435\u0442\u0440\u0430", "2 \u043F\u0435\u0442\u0440\u0430"] },
  { id: "1-john", book: "1 \u0418\u043E\u0430\u043D\u043D\u0430", canonicalBook: "1 John", aliases: ["\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "\u043F\u0435\u0440\u0432\u043E\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "1 \u0438\u043E\u0430\u043D\u043D\u0430"] },
  { id: "2-john", book: "2 \u0418\u043E\u0430\u043D\u043D\u0430", canonicalBook: "2 John", aliases: ["\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "\u0432\u0442\u043E\u0440\u043E\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "2 \u0438\u043E\u0430\u043D\u043D\u0430"] },
  { id: "3-john", book: "3 \u0418\u043E\u0430\u043D\u043D\u0430", canonicalBook: "3 John", aliases: ["\u0442\u0440\u0435\u0442\u044C\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "\u0442\u0440\u0435\u0442\u044C\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "3 \u0438\u043E\u0430\u043D\u043D\u0430"] },
  { id: "jude", book: "\u0418\u0443\u0434\u044B", canonicalBook: "Jude", aliases: ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u0443\u0434\u044B", "\u0438\u0443\u0434\u044B", "\u0438\u0443\u0434\u0430"] },
  { id: "revelation", book: "\u041E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u0435", canonicalBook: "Revelation", aliases: ["\u043E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "\u0430\u043F\u043E\u043A\u0430\u043B\u0438\u043F\u0441\u0438\u0441", "\u043E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u044F", "\u043E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u0435"] }
];
const NUMBER_WORDS = {};
function addNumber(value, words) {
  for (const word of words) NUMBER_WORDS[word] = value;
}
addNumber(1, ["\u043E\u0434\u0438\u043D", "\u043E\u0434\u043D\u0430", "\u043E\u0434\u043D\u043E", "\u043F\u0435\u0440\u0432\u044B\u0439", "\u043F\u0435\u0440\u0432\u0430\u044F", "\u043F\u0435\u0440\u0432\u043E\u0435", "\u043F\u0435\u0440\u0432\u0443\u044E", "\u043F\u0435\u0440\u0432\u043E\u0433\u043E", "\u043F\u0435\u0440\u0432\u043E\u0439", "\u043F\u0435\u0440\u0432\u043E\u043C", "\u043F\u0435\u0440\u0432\u044B\u043C"]);
addNumber(2, ["\u0434\u0432\u0430", "\u0434\u0432\u0435", "\u0432\u0442\u043E\u0440\u043E\u0439", "\u0432\u0442\u043E\u0440\u0430\u044F", "\u0432\u0442\u043E\u0440\u043E\u0435", "\u0432\u0442\u043E\u0440\u0443\u044E", "\u0432\u0442\u043E\u0440\u043E\u0433\u043E", "\u0432\u0442\u043E\u0440\u043E\u043C", "\u0432\u0442\u043E\u0440\u044B\u043C"]);
addNumber(3, ["\u0442\u0440\u0438", "\u0442\u0440\u0435\u0442\u0438\u0439", "\u0442\u0440\u0435\u0442\u044C\u044F", "\u0442\u0440\u0435\u0442\u044C\u0435", "\u0442\u0440\u0435\u0442\u044C\u044E", "\u0442\u0440\u0435\u0442\u044C\u0435\u0433\u043E", "\u0442\u0440\u0435\u0442\u044C\u0435\u043C", "\u0442\u0440\u0435\u0442\u044C\u0438\u043C"]);
addNumber(4, ["\u0447\u0435\u0442\u044B\u0440\u0435", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u044B\u0439", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0430\u044F", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0435", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0443\u044E", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0433\u043E", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0439", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u043C"]);
addNumber(5, ["\u043F\u044F\u0442\u044C", "\u043F\u044F\u0442\u044B\u0439", "\u043F\u044F\u0442\u0430\u044F", "\u043F\u044F\u0442\u043E\u0435", "\u043F\u044F\u0442\u043E\u0433\u043E", "\u043F\u044F\u0442\u043E\u0439", "\u043F\u044F\u0442\u043E\u043C"]);
addNumber(6, ["\u0448\u0435\u0441\u0442\u044C", "\u0448\u0435\u0441\u0442\u043E\u0439", "\u0448\u0435\u0441\u0442\u0430\u044F", "\u0448\u0435\u0441\u0442\u043E\u0435", "\u0448\u0435\u0441\u0442\u043E\u0433\u043E", "\u0448\u0435\u0441\u0442\u043E\u0439", "\u0448\u0435\u0441\u0442\u043E\u043C"]);
addNumber(7, ["\u0441\u0435\u043C\u044C", "\u0441\u0435\u0434\u044C\u043C\u043E\u0439", "\u0441\u0435\u0434\u044C\u043C\u0430\u044F", "\u0441\u0435\u0434\u044C\u043C\u043E\u0435", "\u0441\u0435\u0434\u044C\u043C\u043E\u0433\u043E", "\u0441\u0435\u0434\u044C\u043C\u043E\u0439", "\u0441\u0435\u0434\u044C\u043C\u043E\u043C"]);
addNumber(8, ["\u0432\u043E\u0441\u0435\u043C\u044C", "\u0432\u043E\u0441\u044C\u043C\u043E\u0439", "\u0432\u043E\u0441\u044C\u043C\u0430\u044F", "\u0432\u043E\u0441\u044C\u043C\u043E\u0435", "\u0432\u043E\u0441\u044C\u043C\u043E\u0433\u043E", "\u0432\u043E\u0441\u044C\u043C\u043E\u043C"]);
addNumber(9, ["\u0434\u0435\u0432\u044F\u0442\u044C", "\u0434\u0435\u0432\u044F\u0442\u044B\u0439", "\u0434\u0435\u0432\u044F\u0442\u0430\u044F", "\u0434\u0435\u0432\u044F\u0442\u043E\u0435", "\u0434\u0435\u0432\u044F\u0442\u043E\u0433\u043E", "\u0434\u0435\u0432\u044F\u0442\u043E\u0439", "\u0434\u0435\u0432\u044F\u0442\u043E\u043C"]);
addNumber(10, ["\u0434\u0435\u0441\u044F\u0442\u044C", "\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u0434\u0435\u0441\u044F\u0442\u043E\u0435", "\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u0434\u0435\u0441\u044F\u0442\u043E\u0439", "\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
addNumber(11, ["\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(12, ["\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(13, ["\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(14, ["\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(15, ["\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(16, ["\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(17, ["\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(18, ["\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(19, ["\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(20, ["\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(30, ["\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u044C", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u044B\u0439", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u0430\u044F", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u043E\u0439", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u043E\u043C"]);
addNumber(40, ["\u0441\u043E\u0440\u043E\u043A", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u043E\u0439", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u0430\u044F", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u043E\u0433\u043E", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u043E\u0439", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u043E\u043C"]);
addNumber(50, ["\u043F\u044F\u0442\u044C\u0434\u0435\u0441\u044F\u0442", "\u043F\u044F\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u043F\u044F\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u043F\u044F\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u043F\u044F\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
addNumber(60, ["\u0448\u0435\u0441\u0442\u044C\u0434\u0435\u0441\u044F\u0442", "\u0448\u0435\u0441\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u0448\u0435\u0441\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u0448\u0435\u0441\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u0448\u0435\u0441\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
addNumber(70, ["\u0441\u0435\u043C\u044C\u0434\u0435\u0441\u044F\u0442", "\u0441\u0435\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u0441\u0435\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u0441\u0435\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u0441\u0435\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
addNumber(80, ["\u0432\u043E\u0441\u0435\u043C\u044C\u0434\u0435\u0441\u044F\u0442", "\u0432\u043E\u0441\u044C\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u0432\u043E\u0441\u044C\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u0432\u043E\u0441\u044C\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u0432\u043E\u0441\u044C\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
addNumber(90, ["\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u043E", "\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u044B\u0439", "\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u0430\u044F", "\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u043E\u0433\u043E", "\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u043E\u043C"]);
addNumber(100, ["\u0441\u0442\u043E", "\u0441\u043E\u0442\u044B\u0439", "\u0441\u043E\u0442\u0430\u044F", "\u0441\u043E\u0442\u043E\u0433\u043E", "\u0441\u043E\u0442\u043E\u043C"]);
function normalize(text) {
  return text.toLocaleLowerCase("ru-RU").replaceAll("\u0451", "\u0435").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}
function tokens(text) {
  return normalize(text).match(/[а-яa-z0-9]+/g) ?? [];
}
function tokenNumber(word) {
  if (/^\d{1,3}$/.test(word)) return Number(word);
  return NUMBER_WORDS[word] ?? null;
}
function sumNumberValues(values) {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total > 0 && total <= 176 ? total : null;
}
function parseTrailingNumber(words) {
  const values = [];
  for (let index = words.length - 1; index >= Math.max(0, words.length - 5); index -= 1) {
    if (/^\d{1,3}$/.test(words[index])) return Number(words[index]);
    const value = tokenNumber(words[index]);
    if (value === null) {
      if (values.length > 0) break;
      continue;
    }
    values.unshift(value);
  }
  return sumNumberValues(values);
}
function parseLeadingNumber(words) {
  const values = [];
  const fillers = /* @__PURE__ */ new Set(["\u043D\u043E\u043C\u0435\u0440", "\u044D\u0442\u043E", "\u0441", "\u0441\u043E"]);
  for (const word of words.slice(0, 5)) {
    if (/^\d{1,3}$/.test(word)) return Number(word);
    const value = tokenNumber(word);
    if (value === null) {
      if (values.length > 0) break;
      if (fillers.has(word)) continue;
      break;
    }
    values.push(value);
  }
  return sumNumberValues(values);
}
function numberNearLabel(text, label) {
  const match = label.exec(text);
  if (!match || match.index === void 0) return null;
  const before = tokens(text.slice(Math.max(0, match.index - 55), match.index));
  const after = tokens(text.slice(match.index + match[0].length, match.index + match[0].length + 55));
  const beforeValue = parseTrailingNumber(before);
  if (beforeValue) return beforeValue;
  return parseLeadingNumber(after);
}
function verseRangeNearLabel(text) {
  const label = /стих(?:а|е|и|ов|ом)?/.exec(text);
  if (!label || label.index === void 0) return null;
  const before = tokens(text.slice(Math.max(0, label.index - 70), label.index));
  const connectors = /* @__PURE__ */ new Set(["\u0438", "\u0434\u043E", "\u043F\u043E"]);
  for (let index = before.length - 2; index >= Math.max(0, before.length - 8); index -= 1) {
    if (!connectors.has(before[index])) continue;
    const verseStart2 = parseTrailingNumber(before.slice(0, index));
    const verseEnd = parseLeadingNumber(before.slice(index + 1));
    if (verseStart2 && verseEnd && verseEnd >= verseStart2) return { verseStart: verseStart2, verseEnd };
  }
  const verseStart = parseTrailingNumber(before) ?? numberNearLabel(text, /стих(?:а|е|и|ов|ом)?/);
  return verseStart ? { verseStart } : null;
}
function isWordCharacter(character) {
  return Boolean(character && /[а-яa-z0-9]/.test(character));
}
function hasTokenBoundaries(text, index, length) {
  return !isWordCharacter(text[index - 1]) && !isWordCharacter(text[index + length]);
}
function levenshteinDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        substitution
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}
function tokenSpans(text) {
  return [...text.matchAll(/[а-яa-z0-9]+/g)].map((match) => ({
    value: match[0],
    index: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length
  }));
}
function allowsFuzzyBookMatch(text) {
  return /\d{1,3}\s*[:.]\s*\d{1,3}|глав(?:а|ы|е|у|ой|ою)|стих(?:а|е|и|ов|ом)?|имел[аи]?\s+в\s+виду|имею\s+в\s+виду|поправлюсь|точнее|вернее/.test(text);
}
function findBook(text) {
  const candidates = [];
  for (const book of BOOKS) {
    for (const alias of book.aliases) {
      let index = text.indexOf(alias);
      while (index >= 0) {
        if (hasTokenBoundaries(text, index, alias.length)) {
          candidates.push({ ...book, index, length: alias.length, matchKind: "exact", distance: 0 });
        }
        index = text.indexOf(alias, index + 1);
      }
    }
  }
  if (allowsFuzzyBookMatch(text)) {
    const spans = tokenSpans(text);
    for (const book of BOOKS) {
      for (const alias of book.aliases) {
        const aliasWords = tokens(alias);
        const compactAlias = aliasWords.join(" ");
        if (compactAlias.length < 5) continue;
        for (let index = 0; index <= spans.length - aliasWords.length; index += 1) {
          const window = spans.slice(index, index + aliasWords.length);
          const observed = window.map((span) => span.value).join(" ");
          const maximumDistance = compactAlias.length >= 9 ? 2 : 1;
          const distance = levenshteinDistance(observed, compactAlias);
          if (distance < 1 || distance > maximumDistance) continue;
          candidates.push({
            ...book,
            index: window[0].index,
            length: window.at(-1).end - window[0].index,
            matchKind: "fuzzy",
            distance
          });
        }
      }
    }
  }
  return candidates.sort((left, right) => right.index - left.index || left.distance - right.distance || Number(left.matchKind === "exact") - Number(right.matchKind === "exact") || right.length - left.length)[0] ?? null;
}
function isNegatedCorrection(text, book) {
  const before = text.slice(Math.max(0, book.index - 12), book.index);
  const correctionCue = /имел[аи]?\s+в\s+виду|имею\s+в\s+виду|поправлюсь|точнее|вернее|(?:^|\s)не\s/.test(text);
  return correctionCue && /(?:^|\s)не\s*$/.test(before);
}
function explicitReference(text, book) {
  const searchText = book ? text.slice(book.index + book.length, book.index + book.length + 90) : text;
  const match = searchText.match(/(?:глава\s*)?(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/);
  if (!match) return null;
  const chapter = Number(match[1]);
  const verseStart = Number(match[2]);
  const verseEnd = match[3] ? Number(match[3]) : void 0;
  if (chapter < 1 || chapter > 150 || verseStart < 1 || verseStart > 176) return null;
  return { chapter, verseStart, verseEnd };
}
function referenceKey(bookId, chapter, verseStart, verseEnd) {
  return `${bookId}:${chapter}:${verseStart}:${verseEnd ?? ""}`;
}
class RussianVerseReferenceDetector {
  contextBook = null;
  contextChapter = null;
  contextUpdatedAt = 0;
  recent = /* @__PURE__ */ new Map();
  reset() {
    this.contextBook = null;
    this.contextChapter = null;
    this.contextUpdatedAt = 0;
    this.recent.clear();
  }
  readContext(now = Date.now()) {
    if (this.contextUpdatedAt && now - this.contextUpdatedAt > CONTEXT_TTL_MS) {
      this.contextBook = null;
      this.contextChapter = null;
      this.contextUpdatedAt = 0;
    }
    return {
      bookId: this.contextBook?.id ?? null,
      book: this.contextBook?.book ?? null,
      canonicalBook: this.contextBook?.canonicalBook ?? null,
      chapter: this.contextChapter,
      updatedAt: this.contextUpdatedAt ? new Date(this.contextUpdatedAt).toISOString() : null
    };
  }
  consume(sourceText, now = Date.now()) {
    const text = normalize(sourceText);
    if (!text) return [];
    this.readContext(now);
    let bookMatch = findBook(text);
    const previousBook = this.contextBook;
    if (bookMatch && isNegatedCorrection(text, bookMatch)) {
      this.contextBook = null;
      this.contextChapter = null;
      this.contextUpdatedAt = 0;
      bookMatch = null;
    }
    if (bookMatch) {
      this.contextBook = bookMatch;
      if (previousBook?.id !== bookMatch.id) this.contextChapter = null;
      this.contextUpdatedAt = now;
    }
    const exact = explicitReference(text, bookMatch);
    const spokenVerses = exact ? null : verseRangeNearLabel(text);
    const verseStart = exact?.verseStart ?? spokenVerses?.verseStart ?? null;
    const verseEnd = exact?.verseEnd ?? spokenVerses?.verseEnd;
    const chapter = exact?.chapter ?? numberNearLabel(text, /глав(?:а|ы|е|у|ой|ою)/) ?? (this.contextBook?.id === "psalms" ? numberNearLabel(text, /псал(?:ом|ма|ме|мы|мов|мах|тирь|тырь)/) : null) ?? (verseStart ? this.contextBook?.verseOnlyChapter ?? null : null);
    if (chapter && chapter <= 150) {
      this.contextChapter = chapter;
      this.contextUpdatedAt = now;
    }
    if (!verseStart || !this.contextBook || !this.contextChapter) return [];
    const key = referenceKey(this.contextBook.id, this.contextChapter, verseStart, verseEnd);
    const lastSeen = this.recent.get(key) ?? 0;
    if (now - lastSeen < DUPLICATE_TTL_MS) return [];
    this.recent.set(key, now);
    for (const [recentKey, timestamp] of this.recent) {
      if (now - timestamp > CONTEXT_TTL_MS) this.recent.delete(recentKey);
    }
    const suffix = verseEnd ? `${verseStart}\u2013${verseEnd}` : String(verseStart);
    const confidence = bookMatch && chapter ? "exact" : "context";
    return [{
      id: `${key}:${now}`,
      bookId: this.contextBook.id,
      book: this.contextBook.book,
      canonicalBook: this.contextBook.canonicalBook,
      chapter: this.contextChapter,
      verseStart,
      verseEnd,
      display: `${this.contextBook.book} ${this.contextChapter}:${suffix}`,
      canonical: `${this.contextBook.canonicalBook} ${this.contextChapter}:${suffix}`,
      confidence,
      sourceText: sourceText.trim(),
      detectedAt: new Date(now).toISOString()
    }];
  }
}
export {
  RussianVerseReferenceDetector
};

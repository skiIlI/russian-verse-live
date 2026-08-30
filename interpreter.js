// src/bookDefinitions.ts
var book = (id, canonicalBook, chapters, ruName, ruAliases, enAliases, fallbackChapterOnVerse) => ({
  id,
  canonicalBook,
  chapters,
  names: { ru: ruName, en: canonicalBook },
  aliases: { ru: ruAliases, en: enAliases },
  fallbackChapterOnVerse
});
var BOOKS = [
  book("genesis", "Genesis", 50, "\u0411\u044B\u0442\u0438\u0435", ["\u043A\u043D\u0438\u0433\u0430 \u0431\u044B\u0442\u0438\u0435", "\u043A\u043D\u0438\u0433\u0430 \u0431\u0443\u0442\u0442\u044F", "\u0431\u044B\u0442\u0438\u0435", "\u0431\u044B\u0442\u0438\u044F", "\u0431\u0443\u0442\u0442\u044F", "\u0431\u0442\u0435"], ["book of genesis", "genesis", "gen"]),
  book("exodus", "Exodus", 40, "\u0418\u0441\u0445\u043E\u0434", ["\u043A\u043D\u0438\u0433\u0430 \u0438\u0441\u0445\u043E\u0434", "\u0438\u0441\u0445\u043E\u0434"], ["book of exodus", "exodus", "exod"]),
  book("leviticus", "Leviticus", 27, "\u041B\u0435\u0432\u0438\u0442", ["\u043A\u043D\u0438\u0433\u0430 \u043B\u0435\u0432\u0438\u0442", "\u043B\u0435\u0432\u0438\u0442\u0430", "\u043B\u0435\u0432\u0438\u0442"], ["leviticus", "lev"]),
  book("numbers", "Numbers", 36, "\u0427\u0438\u0441\u043B\u0430", ["\u043A\u043D\u0438\u0433\u0430 \u0447\u0438\u0441\u0435\u043B", "\u0447\u0438\u0441\u0435\u043B", "\u0447\u0438\u0441\u043B\u0430"], ["book of numbers", "numbers", "num"]),
  book("deuteronomy", "Deuteronomy", 34, "\u0412\u0442\u043E\u0440\u043E\u0437\u0430\u043A\u043E\u043D\u0438\u0435", ["\u0432\u0442\u043E\u0440\u043E\u0437\u0430\u043A\u043E\u043D\u0438\u044F", "\u0432\u0442\u043E\u0440\u043E\u0437\u0430\u043A\u043E\u043D\u0438\u0435"], ["deuteronomy", "deut"]),
  book("joshua", "Joshua", 24, "\u0418\u0438\u0441\u0443\u0441 \u041D\u0430\u0432\u0438\u043D", ["\u043A\u043D\u0438\u0433\u0430 \u0438\u0438\u0441\u0443\u0441\u0430 \u043D\u0430\u0432\u0438\u043D\u0430", "\u0438\u0438\u0441\u0443\u0441\u0430 \u043D\u0430\u0432\u0438\u043D\u0430", "\u0438\u0438\u0441\u0443\u0441 \u043D\u0430\u0432\u0438\u043D", "\u043D\u0430\u0432\u0438\u043D\u0430"], ["book of joshua", "joshua", "josh"]),
  book("judges", "Judges", 21, "\u0421\u0443\u0434\u044C\u0438", ["\u043A\u043D\u0438\u0433\u0430 \u0441\u0443\u0434\u0435\u0439", "\u0441\u0443\u0434\u0435\u0439", "\u0441\u0443\u0434\u044C\u0438"], ["book of judges", "judges", "judg"]),
  book("ruth", "Ruth", 4, "\u0420\u0443\u0444\u044C", ["\u043A\u043D\u0438\u0433\u0430 \u0440\u0443\u0444\u044C", "\u0440\u0443\u0444\u0438", "\u0440\u0443\u0444\u044C"], ["book of ruth", "ruth"]),
  book("1-samuel", "1 Samuel", 31, "1 \u0426\u0430\u0440\u0441\u0442\u0432", ["\u043F\u0435\u0440\u0432\u0430\u044F \u043A\u043D\u0438\u0433\u0430 \u0446\u0430\u0440\u0441\u0442\u0432", "\u043F\u0435\u0440\u0432\u043E\u0435 \u0446\u0430\u0440\u0441\u0442\u0432", "\u043F\u0435\u0440\u0432\u0430\u044F \u0446\u0430\u0440\u0441\u0442\u0432", "1 \u0446\u0430\u0440\u0441\u0442\u0432"], ["first samuel", "1st samuel", "1 samuel"]),
  book("2-samuel", "2 Samuel", 24, "2 \u0426\u0430\u0440\u0441\u0442\u0432", ["\u0432\u0442\u043E\u0440\u0430\u044F \u043A\u043D\u0438\u0433\u0430 \u0446\u0430\u0440\u0441\u0442\u0432", "\u0432\u0442\u043E\u0440\u043E\u0435 \u0446\u0430\u0440\u0441\u0442\u0432", "\u0432\u0442\u043E\u0440\u0430\u044F \u0446\u0430\u0440\u0441\u0442\u0432", "2 \u0446\u0430\u0440\u0441\u0442\u0432"], ["second samuel", "2nd samuel", "2 samuel"]),
  book("1-kings", "1 Kings", 22, "3 \u0426\u0430\u0440\u0441\u0442\u0432", ["\u0442\u0440\u0435\u0442\u044C\u044F \u043A\u043D\u0438\u0433\u0430 \u0446\u0430\u0440\u0441\u0442\u0432", "\u0442\u0440\u0435\u0442\u044C\u0435 \u0446\u0430\u0440\u0441\u0442\u0432", "\u0442\u0440\u0435\u0442\u044C\u044F \u0446\u0430\u0440\u0441\u0442\u0432", "3 \u0446\u0430\u0440\u0441\u0442\u0432"], ["first kings", "1st kings", "1 kings"]),
  book("2-kings", "2 Kings", 25, "4 \u0426\u0430\u0440\u0441\u0442\u0432", ["\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0430\u044F \u043A\u043D\u0438\u0433\u0430 \u0446\u0430\u0440\u0441\u0442\u0432", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0435 \u0446\u0430\u0440\u0441\u0442\u0432", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0430\u044F \u0446\u0430\u0440\u0441\u0442\u0432", "4 \u0446\u0430\u0440\u0441\u0442\u0432"], ["second kings", "2nd kings", "2 kings"]),
  book("1-chronicles", "1 Chronicles", 29, "1 \u041F\u0430\u0440\u0430\u043B\u0438\u043F\u043E\u043C\u0435\u043D\u043E\u043D", ["\u043F\u0435\u0440\u0432\u0430\u044F \u043F\u0430\u0440\u0430\u043B\u0438\u043F\u043E\u043C\u0435\u043D\u043E\u043D", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u0430\u0440\u0430\u043B\u0438\u043F\u043E\u043C\u0435\u043D\u043E\u043D", "1 \u043F\u0430\u0440\u0430\u043B\u0438\u043F\u043E\u043C\u0435\u043D\u043E\u043D"], ["first chronicles", "1st chronicles", "1 chronicles"]),
  book("2-chronicles", "2 Chronicles", 36, "2 \u041F\u0430\u0440\u0430\u043B\u0438\u043F\u043E\u043C\u0435\u043D\u043E\u043D", ["\u0432\u0442\u043E\u0440\u0430\u044F \u043F\u0430\u0440\u0430\u043B\u0438\u043F\u043E\u043C\u0435\u043D\u043E\u043D", "\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u0430\u0440\u0430\u043B\u0438\u043F\u043E\u043C\u0435\u043D\u043E\u043D", "2 \u043F\u0430\u0440\u0430\u043B\u0438\u043F\u043E\u043C\u0435\u043D\u043E\u043D"], ["second chronicles", "2nd chronicles", "2 chronicles"]),
  book("ezra", "Ezra", 10, "\u0415\u0437\u0434\u0440\u0430", ["\u043A\u043D\u0438\u0433\u0430 \u0435\u0437\u0434\u0440\u044B", "\u0435\u0437\u0434\u0440\u044B", "\u0435\u0437\u0434\u0440\u0430"], ["book of ezra", "ezra"]),
  book("nehemiah", "Nehemiah", 13, "\u041D\u0435\u0435\u043C\u0438\u044F", ["\u043A\u043D\u0438\u0433\u0430 \u043D\u0435\u0435\u043C\u0438\u0438", "\u043D\u0435\u0435\u043C\u0438\u0438", "\u043D\u0435\u0435\u043C\u0438\u044F"], ["book of nehemiah", "nehemiah", "neh"]),
  book("esther", "Esther", 10, "\u0415\u0441\u0444\u0438\u0440\u044C", ["\u043A\u043D\u0438\u0433\u0430 \u0435\u0441\u0444\u0438\u0440\u044C", "\u0435\u0441\u0444\u0438\u0440\u0438", "\u0435\u0441\u0444\u0438\u0440\u044C"], ["book of esther", "esther", "est"]),
  book("job", "Job", 42, "\u0418\u043E\u0432", ["\u043A\u043D\u0438\u0433\u0430 \u0438\u043E\u0432\u0430", "\u0438\u043E\u0432\u0430", "\u0438\u043E\u0432"], ["book of job", "job"]),
  book("psalms", "Psalms", 150, "\u041F\u0441\u0430\u043B\u043E\u043C", ["\u043A\u043D\u0438\u0433\u0430 \u043F\u0441\u0430\u043B\u043C\u043E\u0432", "\u043F\u0441\u0430\u043B\u0442\u0438\u0440\u044C", "\u043F\u0441\u0430\u043B\u0442\u044B\u0440\u044C", "\u043F\u0441\u0430\u043B\u043C\u0430\u0445", "\u043F\u0441\u0430\u043B\u043C\u043E\u0432", "\u043F\u0441\u0430\u043B\u043C\u044B", "\u043F\u0441\u0430\u043B\u043E\u043C", "\u043F\u0441\u0430\u043B\u043C\u0430", "\u043F\u0441\u0430\u043B\u043C\u0435"], ["book of psalms", "the psalms", "psalms", "psalm"]),
  book("proverbs", "Proverbs", 31, "\u041F\u0440\u0438\u0442\u0447\u0438", ["\u043A\u043D\u0438\u0433\u0430 \u043F\u0440\u0438\u0442\u0447\u0435\u0439", "\u043F\u0440\u0438\u0442\u0447\u0435\u0439", "\u043F\u0440\u0438\u0442\u0447\u0438"], ["book of proverbs", "proverbs", "prov"]),
  book("ecclesiastes", "Ecclesiastes", 12, "\u0415\u043A\u043A\u043B\u0435\u0441\u0438\u0430\u0441\u0442", ["\u0435\u043A\u043A\u043B\u0435\u0441\u0438\u0430\u0441\u0442\u0430", "\u0435\u043A\u043A\u043B\u0435\u0441\u0438\u0430\u0441\u0442", "\u044D\u043A\u043A\u043B\u0435\u0437\u0438\u0430\u0441\u0442"], ["ecclesiastes", "eccles"]),
  book("song", "Song of Solomon", 8, "\u041F\u0435\u0441\u043D\u044C \u041F\u0435\u0441\u043D\u0435\u0439", ["\u043F\u0435\u0441\u043D\u044F \u043F\u0435\u0441\u043D\u0435\u0439", "\u043F\u0435\u0441\u043D\u0438 \u043F\u0435\u0441\u043D\u0435\u0439", "\u043F\u0435\u0441\u043D\u044C \u043F\u0435\u0441\u043D\u0435\u0439"], ["song of solomon", "song of songs", "songs"]),
  book("isaiah", "Isaiah", 66, "\u0418\u0441\u0430\u0438\u044F", ["\u043A\u043D\u0438\u0433\u0430 \u0438\u0441\u0430\u0438\u0438", "\u0438\u0441\u0430\u0438\u0438", "\u0438\u0441\u0430\u0439\u044F", "\u0438\u0441\u0430\u0438\u044F"], ["book of isaiah", "isaiah", "isa"]),
  book("jeremiah", "Jeremiah", 52, "\u0418\u0435\u0440\u0435\u043C\u0438\u044F", ["\u043A\u043D\u0438\u0433\u0430 \u0438\u0435\u0440\u0435\u043C\u0438\u0438", "\u0438\u0435\u0440\u0435\u043C\u0438\u0438", "\u0438\u0435\u0440\u0435\u043C\u0438\u044F"], ["book of jeremiah", "jeremiah", "jer"]),
  book("lamentations", "Lamentations", 5, "\u041F\u043B\u0430\u0447 \u0418\u0435\u0440\u0435\u043C\u0438\u0438", ["\u043A\u043D\u0438\u0433\u0430 \u043F\u043B\u0430\u0447 \u0438\u0435\u0440\u0435\u043C\u0438\u0438", "\u043F\u043B\u0430\u0447 \u0438\u0435\u0440\u0435\u043C\u0438\u0438"], ["lamentations of jeremiah", "lamentations", "lam"]),
  book("ezekiel", "Ezekiel", 48, "\u0418\u0435\u0437\u0435\u043A\u0438\u0438\u043B\u044C", ["\u043A\u043D\u0438\u0433\u0430 \u0438\u0435\u0437\u0435\u043A\u0438\u0438\u043B\u044F", "\u0438\u0435\u0437\u0435\u043A\u0438\u0438\u043B\u044F", "\u0438\u0435\u0437\u0435\u043A\u0438\u0438\u043B\u044C"], ["book of ezekiel", "ezekiel", "ezek"]),
  book("daniel", "Daniel", 12, "\u0414\u0430\u043D\u0438\u0438\u043B", ["\u043A\u043D\u0438\u0433\u0430 \u0434\u0430\u043D\u0438\u0438\u043B\u0430", "\u0434\u0430\u043D\u0438\u0438\u043B\u0430", "\u0434\u0430\u043D\u0438\u0438\u043B"], ["book of daniel", "daniel", "dan"]),
  book("hosea", "Hosea", 14, "\u041E\u0441\u0438\u044F", ["\u043A\u043D\u0438\u0433\u0430 \u043E\u0441\u0438\u0438", "\u043E\u0441\u0438\u0438", "\u043E\u0441\u0438\u044F"], ["book of hosea", "hosea", "hos"]),
  book("joel", "Joel", 3, "\u0418\u043E\u0438\u043B\u044C", ["\u043A\u043D\u0438\u0433\u0430 \u0438\u043E\u0438\u043B\u044F", "\u0438\u043E\u0438\u043B\u044F", "\u0438\u043E\u0438\u043B\u044C"], ["book of joel", "joel"]),
  book("amos", "Amos", 9, "\u0410\u043C\u043E\u0441", ["\u043A\u043D\u0438\u0433\u0430 \u0430\u043C\u043E\u0441\u0430", "\u0430\u043C\u043E\u0441\u0430", "\u0430\u043C\u043E\u0441"], ["book of amos", "amos"]),
  book("obadiah", "Obadiah", 1, "\u0410\u0432\u0434\u0438\u0439", ["\u043A\u043D\u0438\u0433\u0430 \u0430\u0432\u0434\u0438\u044F", "\u0430\u0432\u0434\u0438\u044F", "\u0430\u0432\u0434\u0438\u0439"], ["book of obadiah", "obadiah", "obad"], 1),
  book("jonah", "Jonah", 4, "\u0418\u043E\u043D\u0430", ["\u043A\u043D\u0438\u0433\u0430 \u0438\u043E\u043D\u044B", "\u0438\u043E\u043D\u044B", "\u0438\u043E\u043D\u0430"], ["book of jonah", "jonah"]),
  book("micah", "Micah", 7, "\u041C\u0438\u0445\u0435\u0439", ["\u043A\u043D\u0438\u0433\u0430 \u043C\u0438\u0445\u0435\u044F", "\u043C\u0438\u0445\u0435\u044F", "\u043C\u0438\u0445\u0435\u0439"], ["book of micah", "micah"]),
  book("nahum", "Nahum", 3, "\u041D\u0430\u0443\u043C", ["\u043A\u043D\u0438\u0433\u0430 \u043D\u0430\u0443\u043C\u0430", "\u043D\u0430\u0443\u043C\u0430", "\u043D\u0430\u0443\u043C"], ["book of nahum", "nahum"]),
  book("habakkuk", "Habakkuk", 3, "\u0410\u0432\u0432\u0430\u043A\u0443\u043C", ["\u043A\u043D\u0438\u0433\u0430 \u0430\u0432\u0432\u0430\u043A\u0443\u043C\u0430", "\u0430\u0432\u0432\u0430\u043A\u0443\u043C\u0430", "\u0430\u0432\u0432\u0430\u043A\u0443\u043C"], ["book of habakkuk", "habakkuk", "hab"]),
  book("zephaniah", "Zephaniah", 3, "\u0421\u043E\u0444\u043E\u043D\u0438\u044F", ["\u043A\u043D\u0438\u0433\u0430 \u0441\u043E\u0444\u043E\u043D\u0438\u0438", "\u0441\u043E\u0444\u043E\u043D\u0438\u0438", "\u0441\u043E\u0444\u043E\u043D\u0438\u044F"], ["book of zephaniah", "zephaniah", "zeph"]),
  book("haggai", "Haggai", 2, "\u0410\u0433\u0433\u0435\u0439", ["\u043A\u043D\u0438\u0433\u0430 \u0430\u0433\u0433\u0435\u044F", "\u0430\u0433\u0433\u0435\u044F", "\u0430\u0433\u0433\u0435\u0439"], ["book of haggai", "haggai", "hag"]),
  book("zechariah", "Zechariah", 14, "\u0417\u0430\u0445\u0430\u0440\u0438\u044F", ["\u043A\u043D\u0438\u0433\u0430 \u0437\u0430\u0445\u0430\u0440\u0438\u0438", "\u0437\u0430\u0445\u0430\u0440\u0438\u0438", "\u0437\u0430\u0445\u0430\u0440\u0438\u044F"], ["book of zechariah", "zechariah", "zech"]),
  book("malachi", "Malachi", 4, "\u041C\u0430\u043B\u0430\u0445\u0438\u044F", ["\u043A\u043D\u0438\u0433\u0430 \u043C\u0430\u043B\u0430\u0445\u0438\u0438", "\u043C\u0430\u043B\u0430\u0445\u0438\u0438", "\u043C\u0430\u043B\u0430\u0445\u0438\u044F"], ["book of malachi", "malachi", "mal"], 4),
  book("matthew", "Matthew", 28, "\u041E\u0442 \u041C\u0430\u0442\u0444\u0435\u044F", ["\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u043C\u0430\u0442\u0444\u0435\u044F", "\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u043C\u0430\u0442\u0432\u0435\u044F", "\u0454\u0432\u0430\u043D\u0433\u0435\u043B\u0456\u044F \u0432\u0456\u0434 \u043C\u0430\u0442\u0432\u0456\u044F", "\u043E\u0442 \u043C\u0430\u0442\u0444\u0435\u044F", "\u043E\u0442 \u043C\u0430\u0442\u0432\u0435\u044F", "\u043C\u0430\u0442\u0444\u0435\u044F", "\u043C\u0430\u0442\u0444\u0435\u044E", "\u043C\u0430\u0442\u0444\u0435\u0439", "\u043C\u0430\u0442\u0432\u0435\u044F", "\u043C\u0430\u0442\u0432\u0435\u044E", "\u043C\u0430\u0442\u0432\u0435\u0439", "\u043C\u0430\u0442\u0432\u0456\u044F", "\u043C\u0430\u0442\u0435\u044F"], ["gospel according to matthew", "gospel of matthew", "matthew", "mathew", "mattew"]),
  book("mark", "Mark", 16, "\u041E\u0442 \u041C\u0430\u0440\u043A\u0430", ["\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u043C\u0430\u0440\u043A\u0430", "\u043E\u0442 \u043C\u0430\u0440\u043A\u0430", "\u043C\u0430\u0440\u043A\u0430", "\u043C\u0430\u0440\u043A"], ["gospel according to mark", "gospel of mark", "mark"]),
  book("luke", "Luke", 24, "\u041E\u0442 \u041B\u0443\u043A\u0438", ["\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u043B\u0443\u043A\u0438", "\u043E\u0442 \u043B\u0443\u043A\u0438", "\u043B\u0443\u043A\u043E\u0439", "\u043B\u0443\u043A\u0438", "\u043B\u0443\u043A\u0430"], ["gospel according to luke", "gospel of luke", "luke"]),
  book("john", "John", 21, "\u041E\u0442 \u0418\u043E\u0430\u043D\u043D\u0430", ["\u0435\u0432\u0430\u043D\u0433\u0435\u043B\u0438\u0435 \u043E\u0442 \u0438\u043E\u0430\u043D\u043D\u0430", "\u043E\u0442 \u0438\u043E\u0430\u043D\u043D\u0430", "\u0438\u043E\u0430\u043D\u043D\u0430", "\u0438\u043E\u0430\u043D\u043D"], ["gospel according to john", "gospel of john", "john"]),
  book("acts", "Acts", 28, "\u0414\u0435\u044F\u043D\u0438\u044F", ["\u0434\u0435\u044F\u043D\u0438\u044F \u0441\u0432\u044F\u0442\u044B\u0445 \u0430\u043F\u043E\u0441\u0442\u043E\u043B\u043E\u0432", "\u0434\u0435\u044F\u043D\u0438\u044F \u0430\u043F\u043E\u0441\u0442\u043E\u043B\u043E\u0432", "\u0434\u0435\u044F\u043D\u0438\u0439", "\u0434\u0435\u044F\u043D\u0438\u044F"], ["acts of the apostles", "book of acts", "acts"]),
  book("romans", "Romans", 16, "\u041A \u0420\u0438\u043C\u043B\u044F\u043D\u0430\u043C", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0440\u0438\u043C\u043B\u044F\u043D\u0430\u043C", "\u043A \u0440\u0438\u043C\u043B\u044F\u043D\u0430\u043C", "\u0440\u0438\u043C\u043B\u044F\u043D\u0430\u043C"], ["letter to the romans", "book of romans", "romans"]),
  book("1-corinthians", "1 Corinthians", 16, "1 \u041A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", ["\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u043F\u0435\u0440\u0432\u0430\u044F \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u043F\u0435\u0440\u0432\u044B\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u0438\u0430\u043D\u043E\u043C", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u0438\u0430\u043D\u0430\u043C", "1 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C"], ["first corinthians", "1st corinthians", "1 corinthians"]),
  book("2-corinthians", "2 Corinthians", 13, "2 \u041A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", ["\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u0432\u0442\u043E\u0440\u043E\u0435 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "\u0432\u0442\u043E\u0440\u0430\u044F \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C", "2 \u043A\u043E\u0440\u0438\u043D\u0444\u044F\u043D\u0430\u043C"], ["second corinthians", "2nd corinthians", "2 corinthians"]),
  book("galatians", "Galatians", 6, "\u041A \u0413\u0430\u043B\u0430\u0442\u0430\u043C", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0433\u0430\u043B\u0430\u0442\u0430\u043C", "\u043A \u0433\u0430\u043B\u0430\u0442\u0430\u043C", "\u0433\u0430\u043B\u0430\u0442\u0430\u043C"], ["letter to the galatians", "galatians", "gal"]),
  book("ephesians", "Ephesians", 6, "\u041A \u0415\u0444\u0435\u0441\u044F\u043D\u0430\u043C", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0435\u0444\u0435\u0441\u044F\u043D\u0430\u043C", "\u043A \u0435\u0444\u0435\u0441\u044F\u043D\u0430\u043C", "\u0435\u0444\u0435\u0441\u044F\u043D\u0430\u043C"], ["letter to the ephesians", "ephesians", "eph"]),
  book("philippians", "Philippians", 4, "\u041A \u0424\u0438\u043B\u0438\u043F\u043F\u0438\u0439\u0446\u0430\u043C", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0444\u0438\u043B\u0438\u043F\u043F\u0438\u0439\u0446\u0430\u043C", "\u043A \u0444\u0438\u043B\u0438\u043F\u043F\u0438\u0439\u0446\u0430\u043C", "\u0444\u0438\u043B\u0438\u043F\u043F\u0438\u0439\u0446\u0430\u043C"], ["letter to the philippians", "philippians", "phil"]),
  book("colossians", "Colossians", 4, "\u041A \u041A\u043E\u043B\u043E\u0441\u0441\u044F\u043D\u0430\u043C", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u043A\u043E\u043B\u043E\u0441\u0441\u044F\u043D\u0430\u043C", "\u043A \u043A\u043E\u043B\u043E\u0441\u0441\u044F\u043D\u0430\u043C", "\u043A\u043E\u043B\u043E\u0441\u0441\u044F\u043D\u0430\u043C"], ["letter to the colossians", "colossians", "col"]),
  book("1-thessalonians", "1 Thessalonians", 5, "1 \u0424\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", ["\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", "\u043F\u0435\u0440\u0432\u043E\u0435 \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", "1 \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C"], ["first thessalonians", "1st thessalonians", "1 thessalonians"]),
  book("2-thessalonians", "2 Thessalonians", 3, "2 \u0424\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", ["\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", "\u0432\u0442\u043E\u0440\u043E\u0435 \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C", "2 \u0444\u0435\u0441\u0441\u0430\u043B\u043E\u043D\u0438\u043A\u0438\u0439\u0446\u0430\u043C"], ["second thessalonians", "2nd thessalonians", "2 thessalonians"]),
  book("1-timothy", "1 Timothy", 6, "1 \u0422\u0438\u043C\u043E\u0444\u0435\u044E", ["\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0442\u0438\u043C\u043E\u0444\u0435\u044E", "\u043F\u0435\u0440\u0432\u043E\u0435 \u0442\u0438\u043C\u043E\u0444\u0435\u044E", "1 \u0442\u0438\u043C\u043E\u0444\u0435\u044E"], ["first timothy", "1st timothy", "1 timothy"]),
  book("2-timothy", "2 Timothy", 4, "2 \u0422\u0438\u043C\u043E\u0444\u0435\u044E", ["\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0442\u0438\u043C\u043E\u0444\u0435\u044E", "\u0432\u0442\u043E\u0440\u043E\u0435 \u0442\u0438\u043C\u043E\u0444\u0435\u044E", "2 \u0442\u0438\u043C\u043E\u0444\u0435\u044E"], ["second timothy", "2nd timothy", "2 timothy"]),
  book("titus", "Titus", 3, "\u041A \u0422\u0438\u0442\u0443", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0442\u0438\u0442\u0443", "\u043A \u0442\u0438\u0442\u0443", "\u0442\u0438\u0442\u0443"], ["letter to titus", "titus"]),
  book("philemon", "Philemon", 1, "\u041A \u0424\u0438\u043B\u0438\u043C\u043E\u043D\u0443", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0444\u0438\u043B\u0438\u043C\u043E\u043D\u0443", "\u043A \u0444\u0438\u043B\u0438\u043C\u043E\u043D\u0443", "\u0444\u0438\u043B\u0438\u043C\u043E\u043D\u0443"], ["letter to philemon", "philemon", "philem"], 1),
  book("hebrews", "Hebrews", 13, "\u041A \u0415\u0432\u0440\u0435\u044F\u043C", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043A \u0435\u0432\u0440\u0435\u044F\u043C", "\u043A \u0435\u0432\u0440\u0435\u044F\u043C", "\u0435\u0432\u0440\u0435\u044F\u043C", "\u0454\u0432\u0440\u0435\u044F\u043C"], ["letter to the hebrews", "book of hebrews", "hebrews", "heb"]),
  book("james", "James", 5, "\u0418\u0430\u043A\u043E\u0432\u0430", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u0430\u043A\u043E\u0432\u0430", "\u0438\u0430\u043A\u043E\u0432\u0430", "\u0438\u0430\u043A\u043E\u0432"], ["letter of james", "book of james", "james"]),
  book("1-peter", "1 Peter", 5, "1 \u041F\u0435\u0442\u0440\u0430", ["\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043F\u0435\u0442\u0440\u0430", "\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u0435\u0442\u0440\u0430", "1 \u043F\u0435\u0442\u0440\u0430"], ["first peter", "1st peter", "1 peter"]),
  book("2-peter", "2 Peter", 3, "2 \u041F\u0435\u0442\u0440\u0430", ["\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043F\u0435\u0442\u0440\u0430", "\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u0435\u0442\u0440\u0430", "2 \u043F\u0435\u0442\u0440\u0430"], ["second peter", "2nd peter", "2 peter"]),
  book("1-john", "1 John", 5, "1 \u0418\u043E\u0430\u043D\u043D\u0430", ["\u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "\u043F\u0435\u0440\u0432\u043E\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "1 \u0438\u043E\u0430\u043D\u043D\u0430"], ["first john", "1st john", "1 john"]),
  book("2-john", "2 John", 1, "2 \u0418\u043E\u0430\u043D\u043D\u0430", ["\u0432\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "\u0432\u0442\u043E\u0440\u043E\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "2 \u0438\u043E\u0430\u043D\u043D\u0430"], ["second john", "2nd john", "2 john"], 1),
  book("3-john", "3 John", 1, "3 \u0418\u043E\u0430\u043D\u043D\u0430", ["\u0442\u0440\u0435\u0442\u044C\u0435 \u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "\u0442\u0440\u0435\u0442\u044C\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "3 \u0438\u043E\u0430\u043D\u043D\u0430"], ["third john", "3rd john", "3 john"], 1),
  book("jude", "Jude", 1, "\u0418\u0443\u0434\u044B", ["\u043F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u0438\u0443\u0434\u044B", "\u0438\u0443\u0434\u044B", "\u0438\u0443\u0434\u0430"], ["letter of jude", "book of jude", "jude"], 1),
  book("revelation", "Revelation", 22, "\u041E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u0435", ["\u043E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430 \u0431\u043E\u0433\u043E\u0441\u043B\u043E\u0432\u0430", "\u043E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u0435 \u0438\u043E\u0430\u043D\u043D\u0430", "\u0430\u043F\u043E\u043A\u0430\u043B\u0438\u043F\u0441\u0438\u0441", "\u043E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u044F", "\u043E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u0435"], ["revelation of john", "book of revelation", "revelations", "revelation"])
];

// src/numberParsing.ts
var RU_NUMBERS = {};
var EN_NUMBERS = {};
function add(target, value, words) {
  for (const word of words) target[word] = value;
}
add(RU_NUMBERS, 1, ["\u043E\u0434\u0438\u043D", "\u043E\u0434\u043D\u0430", "\u043E\u0434\u043D\u043E", "\u043F\u0435\u0440\u0432\u044B\u0439", "\u043F\u0435\u0440\u0432\u0430\u044F", "\u043F\u0435\u0440\u0432\u043E\u0435", "\u043F\u0435\u0440\u0432\u0443\u044E", "\u043F\u0435\u0440\u0432\u043E\u0433\u043E", "\u043F\u0435\u0440\u0432\u043E\u0439", "\u043F\u0435\u0440\u0432\u043E\u043C", "\u043F\u0435\u0440\u0432\u044B\u043C"]);
add(RU_NUMBERS, 2, ["\u0434\u0432\u0430", "\u0434\u0432\u0435", "\u0432\u0442\u043E\u0440\u043E\u0439", "\u0432\u0442\u043E\u0440\u0430\u044F", "\u0432\u0442\u043E\u0440\u043E\u0435", "\u0432\u0442\u043E\u0440\u0443\u044E", "\u0432\u0442\u043E\u0440\u043E\u0433\u043E", "\u0432\u0442\u043E\u0440\u043E\u043C", "\u0432\u0442\u043E\u0440\u044B\u043C"]);
add(RU_NUMBERS, 3, ["\u0442\u0440\u0438", "\u0442\u0440\u0435\u0442\u0438\u0439", "\u0442\u0440\u0435\u0442\u044C\u044F", "\u0442\u0440\u0435\u0442\u044C\u0435", "\u0442\u0440\u0435\u0442\u044C\u044E", "\u0442\u0440\u0435\u0442\u044C\u0435\u0433\u043E", "\u0442\u0440\u0435\u0442\u044C\u0435\u0439", "\u0442\u0440\u0435\u0442\u044C\u0435\u043C", "\u0442\u0440\u0435\u0442\u044C\u0438\u043C"]);
add(RU_NUMBERS, 4, ["\u0447\u0435\u0442\u044B\u0440\u0435", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u044B\u0439", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0430\u044F", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0435", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0443\u044E", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0433\u043E", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0439", "\u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u043C", "\u0447\u0435\u0442\u0433\u043E", "\u0447\u0435\u0442\u043E\u0433\u043E"]);
add(RU_NUMBERS, 5, ["\u043F\u044F\u0442\u044C", "\u043F\u044F\u0442\u044B\u0439", "\u043F\u044F\u0442\u0430\u044F", "\u043F\u044F\u0442\u043E\u0435", "\u043F\u044F\u0442\u043E\u0433\u043E", "\u043F\u044F\u0442\u043E\u0439", "\u043F\u044F\u0442\u043E\u043C"]);
add(RU_NUMBERS, 6, ["\u0448\u0435\u0441\u0442\u044C", "\u0448\u0435\u0441\u0442\u043E\u0439", "\u0448\u0435\u0441\u0442\u0430\u044F", "\u0448\u0435\u0441\u0442\u043E\u0435", "\u0448\u0435\u0441\u0442\u043E\u0433\u043E", "\u0448\u0435\u0441\u0442\u043E\u043C"]);
add(RU_NUMBERS, 7, ["\u0441\u0435\u043C\u044C", "\u0441\u0435\u0434\u044C\u043C\u043E\u0439", "\u0441\u0435\u0434\u044C\u043C\u0430\u044F", "\u0441\u0435\u0434\u044C\u043C\u043E\u0435", "\u0441\u0435\u0434\u044C\u043C\u043E\u0433\u043E", "\u0441\u0435\u0434\u044C\u043C\u043E\u043C"]);
add(RU_NUMBERS, 8, ["\u0432\u043E\u0441\u0435\u043C\u044C", "\u0432\u043E\u0441\u044C\u043C\u043E\u0439", "\u0432\u043E\u0441\u044C\u043C\u0430\u044F", "\u0432\u043E\u0441\u044C\u043C\u043E\u0435", "\u0432\u043E\u0441\u044C\u043C\u043E\u0433\u043E", "\u0432\u043E\u0441\u044C\u043C\u043E\u043C"]);
add(RU_NUMBERS, 9, ["\u0434\u0435\u0432\u044F\u0442\u044C", "\u0434\u0435\u0432\u044F\u0442\u044B\u0439", "\u0434\u0435\u0432\u044F\u0442\u0430\u044F", "\u0434\u0435\u0432\u044F\u0442\u043E\u0435", "\u0434\u0435\u0432\u044F\u0442\u043E\u0433\u043E", "\u0434\u0435\u0432\u044F\u0442\u043E\u0439", "\u0434\u0435\u0432\u044F\u0442\u043E\u043C"]);
add(RU_NUMBERS, 10, ["\u0434\u0435\u0441\u044F\u0442\u044C", "\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u0434\u0435\u0441\u044F\u0442\u043E\u0435", "\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u0434\u0435\u0441\u044F\u0442\u043E\u0439", "\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
add(RU_NUMBERS, 11, ["\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 12, ["\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0435", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C", "\u0434\u043D\u0430\u0442\u044B\u0435"]);
add(RU_NUMBERS, 13, ["\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 14, ["\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 15, ["\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 16, ["\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 17, ["\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 18, ["\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 19, ["\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044C", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 20, ["\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044B\u0439", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u0430\u044F", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044B\u0435", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u043E\u0439", "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 30, ["\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u044C", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u044B\u0439", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u0430\u044F", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u044B\u0435", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u043E\u0433\u043E", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u043E\u0439", "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u043E\u043C"]);
add(RU_NUMBERS, 40, ["\u0441\u043E\u0440\u043E\u043A", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u043E\u0439", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u0430\u044F", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u044B\u0435", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u044B\u0445", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u043E\u0433\u043E", "\u0441\u043E\u0440\u043E\u043A\u043E\u0432\u043E\u043C"]);
add(RU_NUMBERS, 50, ["\u043F\u044F\u0442\u044C\u0434\u0435\u0441\u044F\u0442", "\u043F\u044F\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u043F\u044F\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u043F\u044F\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u043F\u044F\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
add(RU_NUMBERS, 60, ["\u0448\u0435\u0441\u0442\u044C\u0434\u0435\u0441\u044F\u0442", "\u0448\u0435\u0441\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u0448\u0435\u0441\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u0448\u0435\u0441\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u0448\u0435\u0441\u0442\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
add(RU_NUMBERS, 70, ["\u0441\u0435\u043C\u044C\u0434\u0435\u0441\u044F\u0442", "\u0441\u0435\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u0441\u0435\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u0441\u0435\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u0441\u0435\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
add(RU_NUMBERS, 80, ["\u0432\u043E\u0441\u0435\u043C\u044C\u0434\u0435\u0441\u044F\u0442", "\u0432\u043E\u0441\u044C\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u044B\u0439", "\u0432\u043E\u0441\u044C\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u0430\u044F", "\u0432\u043E\u0441\u044C\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E", "\u0432\u043E\u0441\u044C\u043C\u0438\u0434\u0435\u0441\u044F\u0442\u043E\u043C"]);
add(RU_NUMBERS, 90, ["\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u043E", "\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u044B\u0439", "\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u0430\u044F", "\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u043E\u0433\u043E", "\u0434\u0435\u0432\u044F\u043D\u043E\u0441\u0442\u043E\u043C"]);
add(RU_NUMBERS, 100, ["\u0441\u0442\u043E", "\u0441\u043E\u0442\u044B\u0439", "\u0441\u043E\u0442\u0430\u044F", "\u0441\u043E\u0442\u043E\u0433\u043E", "\u0441\u043E\u0442\u043E\u043C"]);
add(EN_NUMBERS, 1, ["one", "first"]);
add(EN_NUMBERS, 2, ["two", "second"]);
add(EN_NUMBERS, 3, ["three", "third"]);
add(EN_NUMBERS, 4, ["four", "fourth"]);
add(EN_NUMBERS, 5, ["five", "fifth"]);
add(EN_NUMBERS, 6, ["six", "sixth"]);
add(EN_NUMBERS, 7, ["seven", "seventh"]);
add(EN_NUMBERS, 8, ["eight", "eighth"]);
add(EN_NUMBERS, 9, ["nine", "ninth"]);
add(EN_NUMBERS, 10, ["ten", "tenth"]);
add(EN_NUMBERS, 11, ["eleven", "eleventh"]);
add(EN_NUMBERS, 12, ["twelve", "twelfth"]);
add(EN_NUMBERS, 13, ["thirteen", "thirteenth"]);
add(EN_NUMBERS, 14, ["fourteen", "fourteenth"]);
add(EN_NUMBERS, 15, ["fifteen", "fifteenth"]);
add(EN_NUMBERS, 16, ["sixteen", "sixteenth"]);
add(EN_NUMBERS, 17, ["seventeen", "seventeenth"]);
add(EN_NUMBERS, 18, ["eighteen", "eighteenth"]);
add(EN_NUMBERS, 19, ["nineteen", "nineteenth"]);
add(EN_NUMBERS, 20, ["twenty", "twentieth"]);
add(EN_NUMBERS, 30, ["thirty", "thirtieth"]);
add(EN_NUMBERS, 40, ["forty", "fortieth"]);
add(EN_NUMBERS, 50, ["fifty", "fiftieth"]);
add(EN_NUMBERS, 60, ["sixty", "sixtieth"]);
add(EN_NUMBERS, 70, ["seventy", "seventieth"]);
add(EN_NUMBERS, 80, ["eighty", "eightieth"]);
add(EN_NUMBERS, 90, ["ninety", "ninetieth"]);
add(EN_NUMBERS, 100, ["hundred", "hundredth"]);
var FILLERS = {
  ru: /* @__PURE__ */ new Set(["\u043D\u043E\u043C\u0435\u0440", "\u0446\u0435", "\u044D\u0442\u043E", "\u0437", "\u0456\u0437", "\u0441", "\u0441\u043E", "\u043F\u043E", "\u0438"]),
  en: /* @__PURE__ */ new Set(["number", "the", "and", "from", "at"])
};
function normalizeText(text) {
  return text.toLocaleLowerCase().replaceAll("\u0451", "\u0435").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}
function tokenize(text) {
  return normalizeText(text).match(/[\p{L}\p{N}]+/gu) ?? [];
}
function isNumberToken(token, language) {
  return /^\d{1,3}$/.test(token) || (language === "ru" ? RU_NUMBERS : EN_NUMBERS)[token] !== void 0;
}
function parseNumberTokens(input, language, max = 176) {
  const words = input.filter((word) => !FILLERS[language].has(word));
  if (words.length === 0) return null;
  if (words.length === 1 && /^\d{1,3}$/.test(words[0])) {
    const numeric = Number(words[0]);
    return numeric >= 1 && numeric <= max ? numeric : null;
  }
  if (words.some((word) => /^\d/.test(word))) return null;
  const map = language === "ru" ? RU_NUMBERS : EN_NUMBERS;
  let hundreds = 0;
  let current = 0;
  for (const word of words) {
    const value = map[word];
    if (!value) return null;
    if (value === 100) {
      if (hundreds || current > 9) return null;
      hundreds = (current || 1) * 100;
      current = 0;
      continue;
    }
    if (value >= 20) {
      if (current !== 0) return null;
      current = value;
      continue;
    }
    if (current >= 20 && current < 100) current += value;
    else if (current === 0) current = value;
    else return null;
  }
  const total = hundreds + current;
  return total >= 1 && total <= max ? total : null;
}
function parseTrailingNumber(words, language, max = 176) {
  for (let length = Math.min(6, words.length); length >= 1; length -= 1) {
    const value = parseNumberTokens(words.slice(-length), language, max);
    if (value) return value;
  }
  return null;
}
function parseLeadingNumber(words, language, max = 176) {
  for (let length = Math.min(6, words.length); length >= 1; length -= 1) {
    const value = parseNumberTokens(words.slice(0, length), language, max);
    if (value) return value;
  }
  return null;
}
function parseTwoNumbers(words, language) {
  const clean = words.filter((word) => !FILLERS[language].has(word));
  for (let split = 1; split < clean.length; split += 1) {
    const first = parseNumberTokens(clean.slice(0, split), language, 150);
    const second = parseNumberTokens(clean.slice(split), language, 176);
    if (first && second) return [first, second];
  }
  return null;
}

// src/bibleVerseParser.ts
var CONTEXT_TTL_MS = 6 * 60 * 60 * 1e3;
var FUZZY_BOOK_ONLY_TTL_MS = 30 * 1e3;
var DUPLICATE_TTL_MS = 20 * 1e3;
var CHAPTER_LABELS = {
  ru: /глав(?:а|ы|е|у|ой|ою)|розд(?:іл|ілу|ілі|ілом)/g,
  en: /chapters?/g
};
var VERSE_LABELS = {
  ru: /стих(?:а|е|и|ов|ом)?|текст(?:у|і|ом)?/g,
  en: /verses?/g
};
var RANGE_CONNECTORS = {
  ru: /* @__PURE__ */ new Set(["\u0438", "\u0434\u043E", "\u043F\u043E"]),
  en: /* @__PURE__ */ new Set(["and", "to", "through", "thru"])
};
var AMBIGUOUS_BARE_BOOKS = {
  ru: /* @__PURE__ */ new Set(["proverbs"]),
  en: /* @__PURE__ */ new Set(["acts", "job", "judges", "mark", "numbers", "proverbs", "ruth"])
};
function isWordCharacter(character) {
  return Boolean(character && /[\p{L}\p{N}]/u.test(character));
}
function hasTokenBoundaries(text, index, length) {
  return !isWordCharacter(text[index - 1]) && !isWordCharacter(text[index + length]);
}
function editDistance(left, right) {
  let previousPrevious = null;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, substitution);
      if (previousPrevious && leftIndex > 1 && rightIndex > 1 && left[leftIndex - 1] === right[rightIndex - 2] && left[leftIndex - 2] === right[rightIndex - 1]) {
        current[rightIndex] = Math.min(current[rightIndex], previousPrevious[rightIndex - 2] + 1);
      }
    }
    previousPrevious = previous;
    previous = current;
  }
  return previous[right.length];
}
function commonPrefixLength(left, right) {
  const limit = Math.min(left.length, right.length);
  let length = 0;
  while (length < limit && left[length] === right[length]) length += 1;
  return length;
}
function tokenSpans(text) {
  return [...text.matchAll(/[\p{L}\p{N}]+/gu)].map((match) => ({
    value: match[0],
    index: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length
  }));
}
function allowsFuzzyBookMatch(text, language) {
  const sharedCue = /\d{1,3}\s*[:.]\s*\d{1,3}/.test(text);
  if (language === "ru") {
    return sharedCue || /глав(?:а|ы|е|у|ой|ою)|стих(?:а|е|и|ов|ом)?|имел[аи]?\s+в\s+виду|имею\s+в\s+виду|поправлюсь|точнее|вернее/.test(text);
  }
  return sharedCue || /chapters?|verses?|i\s+(?:mean|meant)|sorry|correction|rather/.test(text);
}
function fuzzyDistanceLimit(alias, observed, language, text) {
  const length = Math.max(alias.length, observed.length);
  const numericReference = /\d{1,3}\s*[:.]\s*\d{1,3}/.test(text);
  if (length <= 4) return numericReference ? 1 : 0;
  if (length <= 6) return 1;
  if (length <= 9) return 2;
  if (length <= 14) return 3;
  const generalLimit = Math.min(5, Math.max(3, Math.floor(length * 0.22)));
  if (language !== "ru") return generalLimit;
  const sharedStem = commonPrefixLength(alias, observed);
  return sharedStem >= Math.max(4, Math.min(alias.length, observed.length) - 3) ? Math.max(generalLimit, 3) : generalLimit;
}
function fuzzyQuality(alias, observed, distance, tokenDelta) {
  const length = Math.max(alias.length, observed.length);
  return distance / length + Math.abs(alias.length - observed.length) / length * 0.08 + tokenDelta * 0.025;
}
function isGenericScriptureWord(observed, language) {
  return language === "ru" ? /писан|библи/u.test(observed) : /scriptur|bible/.test(observed);
}
function hasBookCue(text, match, language) {
  const before = text.slice(Math.max(0, match.index - 26), match.index);
  return language === "ru" ? /(?:книг(?:а|и|е|у|ой|ою)|евангели(?:е|я|и)|послани(?:е|я|и))\s*(?:[,;]\s*(?:а|да|ну|э|не)\s*){0,3}[,;\s]*$/u.test(before) : /(?:book\s+of|gospel(?:\s+according\s+to|\s+of)?|letter\s+to(?:\s+the)?)\s*$/.test(before);
}
function isWeakBookContext(text, match, language) {
  return match.matchKind === "fuzzy" || AMBIGUOUS_BARE_BOOKS[language].has(match.id) && !hasBookCue(text, match, language);
}
function hasUnnumberedVolumeFamily(text, language) {
  const numbered = language === "ru" ? /(?:^|\s)(?:1|2|3|перв\p{L}*|втор\p{L}*|трет\p{L}*)(?=\s|$)/u.test(text) : /(?:^|\s)(?:1|2|3|first|second|third|1st|2nd|3rd)(?=\s|$)/.test(text);
  if (numbered) return false;
  return language === "ru" ? /коринф|фессалоник|тимофе/u.test(text) : /\b(?:corinthians|thessalonians|timothy|samuel|kings|chronicles)\b/.test(text);
}
function findBook(text, language) {
  const candidates = [];
  for (const definition of BOOKS) {
    for (const rawAlias of definition.aliases[language]) {
      const alias = normalizeText(rawAlias);
      let index = text.indexOf(alias);
      while (index >= 0) {
        if (hasTokenBoundaries(text, index, alias.length)) {
          candidates.push({
            ...definition,
            index,
            end: index + alias.length,
            length: alias.length,
            matchKind: "exact",
            distance: 0,
            quality: 0
          });
        }
        index = text.indexOf(alias, index + 1);
      }
    }
  }
  if (allowsFuzzyBookMatch(text, language)) {
    const spans = tokenSpans(text);
    for (const definition of BOOKS) {
      for (const rawAlias of definition.aliases[language]) {
        const aliasWords = tokenize(rawAlias);
        const compactAlias = aliasWords.join("");
        const windowLengths = /* @__PURE__ */ new Set([
          Math.max(1, aliasWords.length - 1),
          aliasWords.length,
          aliasWords.length + 1,
          aliasWords.length + 2
        ]);
        for (const windowLength of windowLengths) {
          for (let index = 0; index <= spans.length - windowLength; index += 1) {
            const window = spans.slice(index, index + windowLength);
            const observed = window.map((span) => span.value).join("");
            if (isGenericScriptureWord(observed, language)) continue;
            const distance = editDistance(observed, compactAlias);
            const maximumDistance = fuzzyDistanceLimit(compactAlias, observed, language, text);
            if (distance < 1 || distance > maximumDistance) continue;
            candidates.push({
              ...definition,
              index: window[0].index,
              end: window.at(-1).end,
              length: window.at(-1).end - window[0].index,
              matchKind: "fuzzy",
              distance,
              quality: fuzzyQuality(compactAlias, observed, distance, windowLength - aliasWords.length)
            });
          }
        }
      }
    }
  }
  const exact = candidates.filter((candidate) => candidate.matchKind === "exact").sort((left, right) => right.end - left.end || right.length - left.length)[0];
  const cued = candidates.filter((candidate) => hasBookCue(text, candidate, language)).sort((left, right) => right.end - left.end || left.quality - right.quality)[0];
  if (cued && (!exact || cued.end > exact.end)) return cued;
  if (exact) return exact;
  const bestByBook = /* @__PURE__ */ new Map();
  for (const candidate of candidates) {
    const current = bestByBook.get(candidate.id);
    if (!current || candidate.quality < current.quality || candidate.quality === current.quality && candidate.end > current.end) bestByBook.set(candidate.id, candidate);
  }
  const ranked = [...bestByBook.values()].sort((left, right) => left.quality - right.quality || left.distance - right.distance || right.end - left.end || right.length - left.length);
  if (ranked.length > 1 && ranked[1].quality - ranked[0].quality < 0.035) return null;
  return ranked[0] ?? null;
}
function isNegatedBook(text, match, language) {
  const before = text.slice(Math.max(0, match.index - 18), match.index);
  return language === "ru" ? /(?:^|\s)не\s*$/.test(before) : /(?:^|\s)not\s*$/.test(before);
}
function firstLabel(text, pattern) {
  pattern.lastIndex = 0;
  return pattern.exec(text);
}
function numberNearLabel(text, labelPattern, language, max) {
  const label = firstLabel(text, labelPattern);
  if (!label || label.index === void 0) return null;
  const before = tokenize(text.slice(Math.max(0, label.index - 70), label.index));
  const afterStart = label.index + label[0].length;
  const after = tokenize(text.slice(afterStart, afterStart + 70));
  const beforeValue = parseTrailingNumber(before, language, max);
  const afterValue = parseLeadingNumber(after, language, max);
  return beforeValue ?? afterValue;
}
function rangeFromTokens(words, language, preferLeading) {
  const connectors = RANGE_CONNECTORS[language];
  for (let index = 1; index < words.length - 1; index += 1) {
    if (!connectors.has(words[index])) continue;
    const verseStart2 = parseTrailingNumber(words.slice(0, index), language);
    const verseEnd = parseLeadingNumber(words.slice(index + 1), language);
    if (verseStart2 && verseEnd && verseEnd >= verseStart2) return { verseStart: verseStart2, verseEnd };
    if (verseStart2 && !verseEnd) return { verseStart: verseStart2 };
  }
  const verseStart = preferLeading ? parseLeadingNumber(words, language) ?? parseTrailingNumber(words, language) : parseTrailingNumber(words, language) ?? parseLeadingNumber(words, language);
  return verseStart ? { verseStart } : null;
}
function verseRangeNearLabel(text, language) {
  const label = firstLabel(text, VERSE_LABELS[language]);
  if (!label || label.index === void 0) return null;
  const before = tokenize(text.slice(Math.max(0, label.index - 85), label.index));
  const afterStart = label.index + label[0].length;
  const after = tokenize(text.slice(afterStart, afterStart + 85));
  return rangeFromTokens(after, language, true) ?? rangeFromTokens(before, language, false);
}
function explicitColonReference(text, match) {
  const searchText = match ? text.slice(match.end, match.end + 100) : text;
  const found = searchText.match(/(?:chapter\s*)?(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?/);
  if (!found) return null;
  const chapter = Number(found[1]);
  const verseStart = Number(found[2]);
  const verseEnd = found[3] ? Number(found[3]) : void 0;
  if (chapter < 1 || verseStart < 1 || verseEnd !== void 0 && verseEnd < 1) return null;
  return { chapter, verseStart, verseEnd };
}
function unlabelledBookPair(text, match, language) {
  const after = text.slice(match.end, match.end + 80);
  if (firstLabel(after, CHAPTER_LABELS[language]) || firstLabel(after, VERSE_LABELS[language])) return null;
  const words = [];
  for (const word of tokenize(after).slice(0, 10)) {
    if (isNumberToken(word, language) || RANGE_CONNECTORS[language].has(word)) words.push(word);
    else if (words.length > 0) break;
    else if (!["at", "in", "\u0432"].includes(word)) break;
  }
  if (words.length < 2) return null;
  return parseTwoNumbers(words, language);
}
function chapterBesideBook(text, match, language) {
  const verseLabel = firstLabel(text.slice(match.end), VERSE_LABELS[language]);
  if (match.id === "psalms") {
    const before = tokenize(text.slice(Math.max(0, match.index - 45), match.index));
    const between = verseLabel?.index === void 0 ? tokenize(text.slice(match.end, match.end + 45)) : tokenize(text.slice(match.end, match.end + verseLabel.index));
    const psalmNumber = parseTrailingNumber(before, language, match.chapters) ?? parseLeadingNumber(between, language, match.chapters) ?? parseTrailingNumber(between, language, match.chapters);
    if (psalmNumber) return psalmNumber;
  }
  if (verseLabel?.index !== void 0) {
    const between = tokenize(text.slice(match.end, match.end + verseLabel.index));
    const value = parseLeadingNumber(between, language, match.chapters) ?? parseTrailingNumber(between, language, match.chapters);
    if (value) return value;
  }
  return null;
}
function referenceKey(bookId, chapter, verseStart, verseEnd) {
  return `${bookId}:${chapter}:${verseStart}:${verseEnd ?? ""}`;
}
var BibleVerseReferenceDetector = class {
  language;
  contextBook = null;
  contextChapter = null;
  contextUpdatedAt = 0;
  contextBookIsWeak = false;
  recent = /* @__PURE__ */ new Map();
  pendingNumberPrefix = null;
  constructor(language = "ru") {
    this.language = language;
  }
  setLanguage(language) {
    if (this.language === language) return;
    this.language = language;
    this.reset();
  }
  getLanguage() {
    return this.language;
  }
  reset() {
    this.contextBook = null;
    this.contextChapter = null;
    this.contextUpdatedAt = 0;
    this.contextBookIsWeak = false;
    this.pendingNumberPrefix = null;
    this.recent.clear();
  }
  readContext(now = Date.now()) {
    const ttl = !this.contextChapter && this.contextBookIsWeak ? FUZZY_BOOK_ONLY_TTL_MS : CONTEXT_TTL_MS;
    if (this.contextUpdatedAt && now - this.contextUpdatedAt > ttl) this.reset();
    return {
      bookId: this.contextBook?.id ?? null,
      book: this.contextBook?.names[this.language] ?? null,
      canonicalBook: this.contextBook?.canonicalBook ?? null,
      chapter: this.contextChapter,
      updatedAt: this.contextUpdatedAt ? new Date(this.contextUpdatedAt).toISOString() : null
    };
  }
  consume(sourceText, now = Date.now()) {
    const normalized = normalizeText(sourceText).replace(/(^|\s)с\s+тих\p{L}*/gu, "$1\u0441\u0442\u0438\u0445");
    if (!normalized) return [];
    this.readContext(now);
    let text = normalized;
    const firstToken = tokenize(normalized)[0];
    const firstValue = firstToken ? parseNumberTokens([firstToken], this.language, 9) : null;
    let splitChapter = null;
    let splitVerse = null;
    if (this.pendingNumberPrefix && firstToken && firstValue) {
      const prefixValue = parseNumberTokens([this.pendingNumberPrefix], this.language, 99);
      const completedChapter = parseNumberTokens(
        [this.pendingNumberPrefix, firstToken],
        this.language,
        this.contextBook?.chapters ?? 150
      );
      const completedVerse = parseNumberTokens([this.pendingNumberPrefix, firstToken], this.language, 176);
      if (completedChapter && firstLabel(normalized, CHAPTER_LABELS[this.language])) {
        text = `${this.pendingNumberPrefix} ${normalized}`;
      } else if (completedChapter && prefixValue === this.contextChapter && firstLabel(normalized, VERSE_LABELS[this.language])) {
        splitChapter = completedChapter;
        text = normalizeText(normalized.slice(firstToken.length));
      } else if (completedVerse && firstLabel(normalized, VERSE_LABELS[this.language])) {
        splitVerse = completedVerse;
        text = normalizeText(normalized.slice(firstToken.length));
      }
    }
    this.pendingNumberPrefix = null;
    if (hasUnnumberedVolumeFamily(text, this.language)) {
      this.contextBook = null;
      this.contextChapter = null;
      this.contextUpdatedAt = 0;
      this.contextBookIsWeak = false;
    }
    let bookMatch = findBook(text, this.language);
    const previousBook = this.contextBook;
    if (bookMatch && isNegatedBook(text, bookMatch, this.language)) {
      this.contextBook = null;
      this.contextChapter = null;
      this.contextUpdatedAt = 0;
      this.contextBookIsWeak = false;
      bookMatch = null;
    } else if (bookMatch) {
      this.contextBook = bookMatch;
      this.contextBookIsWeak = isWeakBookContext(text, bookMatch, this.language);
      if (previousBook?.id !== bookMatch.id) this.contextChapter = null;
      this.contextUpdatedAt = now;
    }
    const colonReference = explicitColonReference(text, bookMatch);
    const pair = !colonReference && bookMatch ? unlabelledBookPair(text, bookMatch, this.language) : null;
    const spokenVerses = colonReference || pair ? null : verseRangeNearLabel(text, this.language);
    const verseStart = colonReference?.verseStart ?? pair?.[1] ?? splitVerse ?? spokenVerses?.verseStart ?? null;
    const verseEnd = colonReference?.verseEnd ?? spokenVerses?.verseEnd;
    const chapter = colonReference?.chapter ?? pair?.[0] ?? numberNearLabel(text, CHAPTER_LABELS[this.language], this.language, this.contextBook?.chapters ?? 150) ?? (bookMatch ? chapterBesideBook(text, bookMatch, this.language) : null) ?? splitChapter ?? (verseStart ? this.contextBook?.fallbackChapterOnVerse ?? null : null);
    if (chapter && this.contextBook && chapter <= this.contextBook.chapters) {
      this.contextChapter = chapter;
      this.contextUpdatedAt = now;
    }
    const trailingToken = tokenize(normalized).at(-1);
    const trailingValue = trailingToken ? parseNumberTokens([trailingToken], this.language, 99) : null;
    if (this.contextBook && trailingToken && trailingValue && trailingValue >= 20 && trailingValue < 100 && trailingValue % 10 === 0) {
      this.pendingNumberPrefix = trailingToken;
    }
    if (!verseStart || verseStart > 176 || !this.contextBook || !this.contextChapter) return [];
    if (verseEnd && (verseEnd < verseStart || verseEnd > 176)) return [];
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
      book: this.contextBook.names[this.language],
      canonicalBook: this.contextBook.canonicalBook,
      chapter: this.contextChapter,
      verseStart,
      verseEnd,
      display: `${this.contextBook.names[this.language]} ${this.contextChapter}:${suffix}`,
      canonical: `${this.contextBook.canonicalBook} ${this.contextChapter}:${suffix}`,
      confidence,
      sourceText: sourceText.trim(),
      detectedAt: new Date(now).toISOString()
    }];
  }
};

// src/navigationDetector.ts
var NEXT = {
  ru: [
    /следующ\p{L}*\s+(?:стих|текст)/u,
    /(?:перейд|переход)\p{L}*\s+(?:к\s+)?следующ/u,
    /(?:дальше|далее)\s+(?:чита|стих|текст)/u
  ],
  en: [/next\s+(?:verse|text|passage)/, /(?:move|go|continue)\s+(?:on\s+)?to\s+the\s+next/]
};
var PREVIOUS = {
  ru: [
    /предыдущ\p{L}*\s+(?:стих|текст)/u,
    /(?:верн|возврат)\p{L}*\s+(?:назад\s+)?(?:к|на)\s+(?:предыдущ|прошл)/u
  ],
  en: [/previous\s+(?:verse|text|passage)/, /(?:go|move|come)\s+back\s+to\s+the\s+(?:previous|last)\s+verse/]
};
function detectNavigationIntent(text, language) {
  const normalized = normalizeText(text);
  if (NEXT[language].some((pattern) => pattern.test(normalized))) return "next";
  if (PREVIOUS[language].some((pattern) => pattern.test(normalized))) return "previous";
  return null;
}

// src/verseCorpus.ts
var STOP_WORDS = {
  ru: /* @__PURE__ */ new Set(["\u0430", "\u0431\u0435\u0437", "\u0431\u044B", "\u0432", "\u0432\u043E", "\u0432\u043E\u0442", "\u0432\u0441\u0435", "\u0434\u043B\u044F", "\u0434\u043E", "\u0435\u0433\u043E", "\u0435\u0435", "\u0436\u0435", "\u0437\u0430", "\u0438", "\u0438\u0437", "\u0438\u043B\u0438", "\u0438\u0445", "\u043A", "\u043A\u0430\u043A", "\u043A\u043E", "\u043C\u043D\u0435", "\u043C\u044B", "\u043D\u0430", "\u043D\u0435", "\u043D\u043E", "\u043E", "\u043E\u0431", "\u043E\u043D", "\u043E\u043D\u0430", "\u043E\u043D\u0438", "\u043E\u0442", "\u043F\u043E", "\u043F\u0440\u0438", "\u0441", "\u0441\u043E", "\u0442\u0430\u043A", "\u0442\u043E", "\u0443", "\u0447\u0442\u043E", "\u044D\u0442\u043E", "\u044F"]),
  en: /* @__PURE__ */ new Set(["a", "all", "and", "are", "as", "at", "be", "but", "by", "for", "from", "had", "has", "have", "he", "her", "him", "his", "i", "in", "is", "it", "me", "my", "not", "of", "on", "or", "our", "she", "so", "that", "the", "their", "them", "they", "this", "to", "was", "we", "were", "will", "with", "you", "your"])
};
var RU_SUFFIXES = ["\u0438\u044F\u043C\u0438", "\u044F\u043C\u0438", "\u0430\u043C\u0438", "\u043E\u0433\u043E", "\u0435\u043C\u0443", "\u043E\u043C\u0443", "\u0438\u043C\u0438", "\u044B\u043C\u0438", "\u0435\u0433\u043E", "\u0443\u044E", "\u044E\u044E", "\u0430\u044F", "\u044F\u044F", "\u044B\u0435", "\u0438\u0435", "\u044B\u0439", "\u0438\u0439", "\u043E\u0439", "\u0430\u043C", "\u044F\u043C", "\u0430\u0445", "\u044F\u0445", "\u043E\u0432", "\u0435\u0432", "\u043E\u043C", "\u0435\u043C", "\u0438\u043C", "\u044B\u043C", "\u0438\u0445", "\u044B\u0445", "\u0438\u044E", "\u044C\u044E", "\u0438\u044F", "\u0435\u0439", "\u043E\u044E", "\u0435\u044E", "\u044B", "\u0438", "\u0430", "\u044F", "\u0443", "\u044E", "\u0435", "\u043E"];
var EN_SUFFIXES = ["ingly", "edly", "ing", "ies", "ied", "ed", "es", "s"];
var EN_EQUIVALENTS = {
  tongu: "speech",
  languag: "speech",
  resound: "sound",
  sound: "sound",
  bras: "gong",
  gong: "gong",
  fathom: "understand",
  know: "understand",
  remov: "move",
  remove: "move",
  move: "move"
};
var RU_ASR_EQUIVALENTS = {
  \u043F\u043E\u043F\u0440\u044B\u0448\u0435\u0441\u0442\u0432: "\u043F\u0440\u043E\u0448\u0435\u0441\u0442\u0432\u0438",
  \u043F\u043E\u043F\u0440\u044B\u0448\u0435\u0441\u0442\u0432\u0438: "\u043F\u0440\u043E\u0448\u0435\u0441\u0442\u0432\u0438",
  \u043F\u0440\u0438\u0448\u0435\u0441\u0442\u0432\u0438: "\u043F\u0440\u043E\u0448\u0435\u0441\u0442\u0432\u0438",
  \u043F\u043E\u0432\u043E\u0434: "\u0432\u043E\u0434\u0430\u043C",
  \u0432\u043E\u0437\u0440\u0430\u0442\u0438\u0435\u0442\u0441: "\u043D\u0430\u0438\u0434\u0435\u0448\u044C",
  \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441: "\u043D\u0430\u0438\u0434\u0435\u0448\u044C",
  \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0438\u0435\u0442\u0441: "\u043D\u0430\u0438\u0434\u0435\u0448\u044C"
};
function normalizeForMatching(text) {
  return text.normalize("NFKD").toLocaleLowerCase().replace(/[\u0300-\u036f]/g, "").replaceAll("\u0451", "\u0435").replaceAll("\u0456", "\u0438").replaceAll("\u0457", "\u0438").replaceAll("\u0454", "\u0435").replaceAll("\u0491", "\u0433").replace(/[’']/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}
function stem(token, language) {
  const suffixes = language === "ru" ? RU_SUFFIXES : EN_SUFFIXES;
  for (const suffix of suffixes) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 4) {
      const stemmed = token.slice(0, -suffix.length);
      return language === "en" ? EN_EQUIVALENTS[stemmed] ?? stemmed : RU_ASR_EQUIVALENTS[stemmed] ?? stemmed;
    }
  }
  return language === "en" ? EN_EQUIVALENTS[token] ?? token : RU_ASR_EQUIVALENTS[token] ?? token;
}
function matchingTokens(text, language, meaningfulOnly = false) {
  const raw = normalizeForMatching(text).match(/[\p{L}\p{N}]+/gu) ?? [];
  return raw.filter((token) => !meaningfulOnly || token.length >= 3 && !STOP_WORDS[language].has(token)).map((token) => stem(token, language));
}
var VerseCorpusIndex = class {
  language;
  document;
  verses;
  postings = /* @__PURE__ */ new Map();
  byChapter = /* @__PURE__ */ new Map();
  byKey = /* @__PURE__ */ new Map();
  constructor(document) {
    this.document = document;
    this.language = document.language;
    this.verses = document.verses.map(([bookId, chapter, verse, text], index) => ({
      index,
      key: `${bookId}:${chapter}:${verse}`,
      bookId,
      chapter,
      verse,
      text,
      tokens: matchingTokens(text, document.language),
      meaningful: matchingTokens(text, document.language, true)
    }));
    const frequency = /* @__PURE__ */ new Map();
    for (const verse of this.verses) {
      this.byKey.set(verse.key, verse);
      const chapterKey = `${verse.bookId}:${verse.chapter}`;
      const chapter = this.byChapter.get(chapterKey) ?? [];
      chapter.push(verse.index);
      this.byChapter.set(chapterKey, chapter);
      for (const token of new Set(verse.meaningful)) frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
    for (const verse of this.verses) {
      for (const token of new Set(verse.meaningful)) {
        if ((frequency.get(token) ?? 0) > 1200) continue;
        const entries = this.postings.get(token) ?? [];
        entries.push(verse.index);
        this.postings.set(token, entries);
      }
    }
  }
  chapter(bookId, chapter) {
    if (!bookId || !chapter) return [];
    return (this.byChapter.get(`${bookId}:${chapter}`) ?? []).map((index) => this.verses[index]);
  }
};
var CORPUS_PATHS = {
  ru: "./data/russyn.json",
  en: "./data/engwebp.json"
};
var cache = /* @__PURE__ */ new Map();
function loadVerseCorpus(language, fetcher = fetch) {
  const existing = cache.get(language);
  if (existing) return existing;
  const pending = fetcher(CORPUS_PATHS[language]).then((response) => {
    if (!response.ok) throw new Error(`Bible corpus returned ${response.status}`);
    return response.json();
  }).then((document) => new VerseCorpusIndex(document));
  cache.set(language, pending);
  pending.catch(() => cache.delete(language));
  return pending;
}

// src/quoteScoring.ts
function closeToken(left, right) {
  if (left === right) return true;
  if (Math.min(left.length, right.length) < 4 || Math.abs(left.length - right.length) > 1) return false;
  let differences = 0;
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }
    differences += 1;
    if (differences > 1) return false;
    if (left.length > right.length) leftIndex += 1;
    else if (right.length > left.length) rightIndex += 1;
    else {
      leftIndex += 1;
      rightIndex += 1;
    }
  }
  return differences + Number(leftIndex < left.length || rightIndex < right.length) <= 1;
}
function overlapCount(reference, observed) {
  const remaining = [...observed];
  let count = 0;
  for (const token of reference) {
    const index = remaining.findIndex((candidate) => closeToken(token, candidate));
    if (index < 0) continue;
    count += 1;
    remaining.splice(index, 1);
  }
  return count;
}
function orderedCount(reference, observed) {
  const previous = new Uint16Array(observed.length + 1);
  for (const referenceToken of reference) {
    const current = new Uint16Array(observed.length + 1);
    for (let index = 1; index <= observed.length; index += 1) {
      current[index] = closeToken(referenceToken, observed[index - 1]) ? previous[index - 1] + 1 : Math.max(current[index - 1], previous[index]);
    }
    previous.set(current);
  }
  return previous[observed.length];
}
function longestOrderedRun(reference, observed) {
  let longest = 0;
  for (let left = 0; left < reference.length; left += 1) {
    for (let right = 0; right < observed.length; right += 1) {
      let run = 0;
      while (left + run < reference.length && right + run < observed.length && closeToken(reference[left + run], observed[right + run])) run += 1;
      longest = Math.max(longest, run);
    }
  }
  return longest;
}
function scoreQuote(reference, observed, { contextual = false, cued = false } = {}) {
  if (reference.length < 3 || observed.length < 3) return null;
  const matched = overlapCount(reference, observed);
  const orderedMatched = orderedCount(reference, observed);
  const longestRun = longestOrderedRun(reference, observed);
  const coverage = matched / reference.length;
  const ordered = orderedMatched / reference.length;
  const runBonus = Math.min(0.12, Math.max(0, longestRun - 3) * 0.03);
  const score = coverage * 0.66 + ordered * 0.34 + runBonus + (contextual ? 0.035 : 0) + (cued ? 0.02 : 0);
  const minimumMatched = reference.length <= 5 ? 3 : reference.length <= 11 ? 4 : 6;
  const baseCoverage = reference.length <= 5 ? 0.78 : reference.length <= 11 ? 0.6 : 0.48;
  const strongPartialQuote = (contextual || cued) && longestRun >= 5;
  const minimumCoverage = contextual || cued ? Math.min(baseCoverage, strongPartialQuote ? 0.5 : baseCoverage) : Math.max(0.66, baseCoverage);
  const minimumScore = contextual ? 0.55 : cued ? 0.6 : 0.75;
  const observedPrecision = matched / observed.length;
  const weakUncontextualizedQuote = cued && !contextual && score < 0.72 && longestRun < 4 && observedPrecision < 0.36;
  if (matched < minimumMatched || coverage < minimumCoverage || score < minimumScore || weakUncontextualizedQuote) return null;
  return { score: Math.min(0.99, score), coverage, ordered, matched };
}

// src/quoteMatcher.ts
function candidateIndices(windowTokens, corpus, context) {
  const candidates = /* @__PURE__ */ new Map();
  for (const token of new Set(windowTokens)) {
    for (const index of corpus.postings.get(token) ?? []) {
      const current = candidates.get(index) ?? { anchors: 0, contextual: false };
      current.anchors += 1;
      candidates.set(index, current);
    }
  }
  for (const verse of corpus.chapter(context?.bookId ?? null, context?.chapter ?? null)) {
    if (context?.verseStart && (verse.verse < context.verseStart || verse.verse > (context.verseEnd ?? context.verseStart))) continue;
    const current = candidates.get(verse.index) ?? { anchors: 0, contextual: true };
    current.contextual = true;
    candidates.set(verse.index, current);
  }
  return candidates;
}
function hasQuoteCue(text, language) {
  const normalized = text.toLocaleLowerCase();
  return language === "ru" ? /писан|библи|слово.{0,30}говор|чита(?:ем|ю|ть)|прочита|зачита|стих|текст/u.test(normalized) : /scripture|bible|(?:the\s+)?word.{0,24}says?|(?:we\s+)?read|written|verse/.test(normalized);
}
function alignedWithContext(match, context) {
  if (!context?.bookId || !context.chapter) return false;
  if (match.verse.bookId !== context.bookId || match.verse.chapter !== context.chapter) return false;
  if (!context.verseStart) return true;
  return match.verse.verse >= context.verseStart && match.verse.verse <= (context.verseEnd ?? context.verseStart);
}
function preferContext(matches, contexts) {
  return matches.filter((match) => {
    const context = contexts[match.segmentIndex];
    if (!context?.bookId) return true;
    if (alignedWithContext(match, context)) {
      const strongerAlternative2 = matches.find((candidate) => candidate.segmentIndex === match.segmentIndex && !alignedWithContext(candidate, context) && candidate.score > match.score + 0.04);
      return !strongerAlternative2;
    }
    const contextualWinner = matches.find((candidate) => candidate.segmentIndex === match.segmentIndex && alignedWithContext(candidate, context) && candidate.score >= match.score - 0.03);
    if (contextualWinner) return false;
    const strongerAlternative = matches.find((candidate) => candidate.segmentIndex === match.segmentIndex && candidate.score > match.score + 0.04);
    return !strongerAlternative;
  });
}
function bestSourceSegment(segments, start, end, verse, language) {
  const verseTokens = new Set(verse.meaningful);
  let bestIndex = start;
  let bestHits = -1;
  for (let index = start; index <= end; index += 1) {
    const hits = matchingTokens(segments[index].text, language, true).filter((token) => verseTokens.has(token)).length;
    if (hits > bestHits) {
      bestHits = hits;
      bestIndex = index;
    }
  }
  return bestIndex;
}
function collapseOverlapping(matches) {
  const byVerse = /* @__PURE__ */ new Map();
  for (const match of matches) {
    const entries = byVerse.get(match.verse.key) ?? [];
    entries.push(match);
    byVerse.set(match.verse.key, entries);
  }
  const collapsed = [];
  for (const entries of byVerse.values()) {
    entries.sort((left, right) => left.segmentIndex - right.segmentIndex || right.score - left.score);
    let cluster = [];
    const flush = () => {
      if (!cluster.length) return;
      collapsed.push(cluster.sort((left, right) => right.score - left.score || left.segmentIndex - right.segmentIndex)[0]);
      cluster = [];
    };
    for (const entry of entries) {
      const lastEnd = cluster.reduce((maximum, item) => Math.max(maximum, item.endSegmentIndex), -1);
      if (cluster.length && entry.segmentIndex > lastEnd + 1) flush();
      cluster.push(entry);
    }
    flush();
  }
  return collapsed.sort((left, right) => left.segmentIndex - right.segmentIndex || left.verse.index - right.verse.index);
}
function matchQuotedVerses(segments, corpus, contexts, { ignoreMusic = true, ignorePrayer = true, maxWindow = 4 } = {}) {
  const matches = [];
  for (let start = 0; start < segments.length; start += 1) {
    if (ignoreMusic && segments[start].isMusic) continue;
    if (ignorePrayer && segments[start].isPrayer) continue;
    for (let end = start; end < Math.min(segments.length, start + maxWindow); end += 1) {
      if (ignoreMusic && segments[end].isMusic) break;
      if (ignorePrayer && segments[end].isPrayer) break;
      const sourceText = segments.slice(start, end + 1).map((segment) => segment.text).join(" ");
      const windowTokens = matchingTokens(sourceText, corpus.language, true);
      if (windowTokens.length < 3 || windowTokens.length > 95) continue;
      for (const [verseIndex, candidate] of candidateIndices(windowTokens, corpus, contexts[start])) {
        const verse = corpus.verses[verseIndex];
        const activeContext = contexts[start];
        if (activeContext?.verseStart && activeContext.verseEnd !== void 0 && verse.bookId === activeContext.bookId && verse.chapter === activeContext.chapter && (verse.verse < activeContext.verseStart || verse.verse > (activeContext.verseEnd ?? activeContext.verseStart))) continue;
        const minimumAnchors = verse.meaningful.length <= 6 ? 2 : 3;
        if (!candidate.contextual && candidate.anchors < minimumAnchors) continue;
        const segmentIndex = bestSourceSegment(segments, start, end, verse, corpus.language);
        const cued = hasQuoteCue(segments[segmentIndex].text, corpus.language);
        if (!candidate.contextual && !cued && verse.meaningful.length < 6) continue;
        const scored = scoreQuote(verse.meaningful, windowTokens, { contextual: candidate.contextual, cued });
        if (!scored) continue;
        matches.push({
          verse,
          segmentIndex,
          endSegmentIndex: end,
          score: scored.score,
          coverage: scored.coverage,
          sourceText
        });
      }
    }
  }
  return preferContext(collapseOverlapping(matches), contexts);
}

// src/transcriptInput.ts
var CLOCK_PREFIX = /^(\d{1,2}(?::\d{2}){1,2})/;
var SPOKEN_DURATION = /^(?:(?:\d+\s+hours?)(?:,\s*)?)?(?:(?:\d+\s+minutes?)(?:,\s*)?)?(?:\d+\s+seconds?)?/i;
var MUSIC_MARKERS = /\[(?:music|singing|song|музыка|пение|песня)\]/i;
var PRAYER_START = /давайте.*(?:помол|молит)|сейчас.{0,28}(?:будем\s+)?молит|(?:встан|стан)\p{L}*.{0,45}(?:помол|просить\s+благослов)|ми\s+будемо\s+молитися|склон\p{L}*.{0,25}колен|отче\s+наш|our\s+father|let\s+us\s+pray|bow.{0,24}(?:head|knee)/iu;
var PRAYER_END = /(?:(?:^|\s)(?:аминь|amen)[.!?]*(?:\s+(?:не|ne)[.!?]*)?$)|(?:(?:^|\s)аминь[.!?]?.*(?:садит|присяд|sit\s+down))/iu;
function soundsLikePrayer(text) {
  const invocations = text.match(/(?:^|[^\p{L}])(?:господ\p{L}*|боже|бог\p{L}*|lord|god)(?=$|[^\p{L}])/giu)?.length ?? 0;
  return invocations >= 2 && /просим|молим|благодарим|благослови|слава\s+тебе|we\s+(?:ask|pray|thank)|please\s+bless/iu.test(text);
}
function clockToSeconds(clock) {
  const parts = clock.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}
function formatClock(seconds) {
  if (seconds === null || !Number.isFinite(seconds)) return "--:--";
  const whole = Math.max(0, Math.round(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor(whole % 3600 / 60);
  const remainder = whole % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`;
}
function removeTranscriptPrefix(raw) {
  const clock = raw.match(CLOCK_PREFIX)?.[1] ?? null;
  if (!clock) return { timestamp: null, startSeconds: null, text: raw.trim() };
  let remainder = raw.slice(clock.length);
  const duration = remainder.match(SPOKEN_DURATION)?.[0] ?? "";
  if (/\d+\s+(?:hours?|minutes?|seconds?)/i.test(duration)) remainder = remainder.slice(duration.length);
  return { timestamp: clock, startSeconds: clockToSeconds(clock), text: remainder.trim() };
}
function parseTranscript(input) {
  const segments = [];
  let prayerMode = false;
  for (const [lineIndex, rawLine] of input.replace(/^\uFEFF/, "").split(/\r?\n/).entries()) {
    const raw = rawLine.trim();
    if (!raw || /^https?:\/\//i.test(raw)) continue;
    const parsed = removeTranscriptPrefix(raw);
    if (!parsed.text) continue;
    if (PRAYER_START.test(parsed.text) || soundsLikePrayer(parsed.text)) prayerMode = true;
    const isPrayer = prayerMode;
    segments.push({
      index: segments.length,
      lineNumber: lineIndex + 1,
      timestamp: parsed.timestamp,
      startSeconds: parsed.startSeconds,
      text: parsed.text,
      raw,
      isMusic: MUSIC_MARKERS.test(parsed.text),
      isPrayer
    });
    if (prayerMode && PRAYER_END.test(parsed.text)) prayerMode = false;
  }
  return segments;
}

// src/transcriptInterpreter.ts
var EVENT_ORDER = {
  context: 0,
  open: 1,
  jump: 2,
  next: 3,
  previous: 3,
  advance: 4,
  read: 5
};
function segmentMoment(segment) {
  return Date.UTC(2026, 0, 1) + (segment.startSeconds ?? segment.index) * 1e3;
}
function displayReference(bookId, chapter, language, verseStart, verseEnd) {
  const definition = BOOKS.find((book3) => book3.id === bookId);
  const book2 = definition?.names[language] ?? bookId;
  const canonicalBook = definition?.canonicalBook ?? bookId;
  const suffix = verseStart ? `:${verseStart}${verseEnd ? `\u2013${verseEnd}` : ""}` : "";
  return {
    bookId,
    book: book2,
    canonicalBook,
    chapter,
    verseStart,
    verseEnd,
    display: `${book2} ${chapter}${suffix}`,
    canonical: `${canonicalBook} ${chapter}${suffix}`
  };
}
function fromParser(reference, language) {
  return displayReference(reference.bookId, reference.chapter, language, reference.verseStart, reference.verseEnd);
}
function fromVerse(verse, language) {
  return displayReference(verse.bookId, verse.chapter, language, verse.verse);
}
function makeEvent(segment, type, action, reference, confidence, basis, sourceText = segment.text) {
  const key = reference?.canonical ?? "unresolved";
  return {
    id: `${segment.index}:${type}:${key}`,
    type,
    action,
    segmentIndex: segment.index,
    lineNumber: segment.lineNumber,
    timestamp: segment.timestamp,
    seconds: segment.startSeconds,
    reference,
    confidence: Math.round(confidence * 1e3) / 1e3,
    basis,
    sourceText
  };
}
function collectExplicit(segments, language, ignorePrayer) {
  const detector = new BibleVerseReferenceDetector(language);
  const events = [];
  const contexts = [];
  let previousContext = "";
  let activeRange = null;
  const labelCue = language === "ru" ? /глав\p{L}*|стих\p{L}*|текст\p{L}*/u : /chapters?|verses?/;
  const danglingBookRelation = language === "ru" ? /связан\p{L}*.{0,24}с\s+книг\p{L}*,\s+(?:[\p{L}-]+[,;\s]*){2,3}$/u : /(?:connected|related).{0,24}(?:to|with)\s+(?:the\s+)?book(?:\s+of)?(?:\s+[a-z-]{1,14})?[,.;\s]*$/;
  for (const segment of segments) {
    const now = segmentMoment(segment);
    if (ignorePrayer && segment.isPrayer) {
      const context2 = detector.readContext(now);
      contexts[segment.index] = { bookId: context2.bookId, chapter: context2.chapter };
      continue;
    }
    const prior = segments[segment.index - 1];
    const hasDanglingRelation = Boolean(prior && labelCue.test(segment.text) && danglingBookRelation.test(prior.text));
    let nearbyPrior = prior && !prior.isMusic && !prior.isPrayer && prior.startSeconds !== null && segment.startSeconds !== null && segment.startSeconds - prior.startSeconds <= 12 && prior.text.length <= 90 && !labelCue.test(prior.text);
    if (hasDanglingRelation && prior) {
      const activeBook = detector.readContext(now).bookId;
      const probe = new BibleVerseReferenceDetector(language);
      probe.consume(`${prior.text} ${segment.text}`, now);
      const relatedBook = probe.readContext(now).bookId;
      detector.reset();
      nearbyPrior = Boolean(relatedBook && relatedBook !== activeBook);
    }
    const parserText = nearbyPrior && labelCue.test(segment.text) ? `${prior.text} ${segment.text}` : segment.text;
    const references = detector.consume(parserText, now);
    const context = detector.readContext(now);
    const contextKey = `${context.bookId ?? ""}:${context.chapter ?? ""}`;
    if (contextKey !== previousContext) activeRange = null;
    if (references[0]) {
      activeRange = { verseStart: references[0].verseStart, verseEnd: references[0].verseEnd };
    }
    contexts[segment.index] = {
      bookId: context.bookId,
      chapter: context.chapter,
      verseStart: activeRange?.verseStart,
      verseEnd: activeRange?.verseEnd
    };
    if (context.bookId && context.chapter && contextKey !== previousContext && references.length === 0) {
      events.push(makeEvent(
        segment,
        "context",
        "SET_CONTEXT",
        displayReference(context.bookId, context.chapter, language),
        0.86,
        "chapter-context"
      ));
    }
    previousContext = contextKey;
    for (const reference of references) {
      const type = reference.confidence === "context" ? "jump" : "open";
      events.push(makeEvent(
        segment,
        type,
        type === "jump" ? "GO_TO_VERSE" : "OPEN_VERSE",
        fromParser(reference, language),
        reference.confidence === "exact" ? 0.99 : 0.93,
        "explicit-reference"
      ));
    }
    const navigation = detectNavigationIntent(segment.text, language);
    if (navigation) {
      events.push(makeEvent(
        segment,
        navigation,
        navigation === "next" ? "NEXT_VERSE" : "PREVIOUS_VERSE",
        null,
        0.96,
        "spoken-navigation"
      ));
    }
  }
  return { events, contexts };
}
function quoteEvents(matches, segments, language) {
  return matches.map((match) => makeEvent(
    segments[match.segmentIndex],
    "read",
    "VERSE_READ",
    fromVerse(match.verse, language),
    match.score,
    "verse-text-match",
    match.sourceText
  ));
}
function resolveNavigation(events, corpus) {
  const readings = events.filter((event) => event.type === "read" && event.reference);
  for (const event of events.filter((candidate) => candidate.type === "next" || candidate.type === "previous")) {
    const nearby = readings.find((reading) => Math.abs(reading.segmentIndex - event.segmentIndex) <= 1);
    if (nearby?.reference) {
      event.reference = nearby.reference;
      continue;
    }
    const prior = [...events].filter((candidate) => candidate.segmentIndex < event.segmentIndex && candidate.reference?.verseStart).sort((left, right) => right.segmentIndex - left.segmentIndex)[0];
    if (!prior?.reference?.verseStart) continue;
    const offset = event.type === "next" ? 1 : -1;
    const targetVerse = prior.reference.verseStart + offset;
    const target = corpus.byKey.get(`${prior.reference.bookId}:${prior.reference.chapter}:${targetVerse}`);
    if (target) event.reference = displayReference(target.bookId, target.chapter, corpus.language, target.verse);
  }
}
function expandPartialRanges(events, language) {
  const rangeCue = language === "ru" ? /(?:^|\s)(?:по|до)(?=\s|$)/u : /(?:^|\s)(?:to|through|thru)(?=\s|$)/;
  const readings = events.filter((event) => event.type === "read" && event.reference?.verseStart);
  for (const event of events.filter((candidate) => ["open", "jump"].includes(candidate.type) && candidate.reference?.verseStart && !candidate.reference.verseEnd && rangeCue.test(candidate.sourceText.toLocaleLowerCase()))) {
    const reference = event.reference;
    const observed = readings.filter((reading) => reading.segmentIndex >= event.segmentIndex && reading.segmentIndex <= event.segmentIndex + 24 && reading.reference?.bookId === reference.bookId && reading.reference.chapter === reference.chapter).map((reading) => reading.reference.verseStart).sort((left, right) => left - right);
    let verseEnd = reference.verseStart;
    for (const verse of new Set(observed)) {
      if (verse === verseEnd || verse === verseEnd + 1) verseEnd = Math.max(verseEnd, verse);
    }
    if (verseEnd > reference.verseStart) {
      event.reference = displayReference(reference.bookId, reference.chapter, language, reference.verseStart, verseEnd);
    }
  }
}
function deriveReadingBoundaries(events, segments) {
  const readings = events.filter((event) => event.type === "read" && event.reference?.verseStart).sort((left, right) => left.segmentIndex - right.segmentIndex || (left.reference?.verseStart ?? 0) - (right.reference?.verseStart ?? 0));
  const boundaries = [];
  for (let index = 1; index < readings.length; index += 1) {
    const previous = readings[index - 1];
    const current = readings[index];
    const previousReference = previous.reference;
    const currentReference = current.reference;
    if (previousReference.bookId !== currentReference.bookId || previousReference.chapter !== currentReference.chapter || currentReference.verseStart !== (previousReference.verseStart ?? 0) + 1) continue;
    const spoken = events.some((event) => ["next", "jump"].includes(event.type) && event.segmentIndex === current.segmentIndex);
    if (spoken) continue;
    boundaries.push(makeEvent(
      segments[current.segmentIndex],
      "advance",
      "NEXT_VERSE",
      currentReference,
      Math.min(previous.confidence, current.confidence),
      "reading-boundary",
      current.sourceText
    ));
  }
  return boundaries;
}
function uniqueEvents(events) {
  const seen = /* @__PURE__ */ new Set();
  return events.sort((left, right) => left.segmentIndex - right.segmentIndex || EVENT_ORDER[left.type] - EVENT_ORDER[right.type]).filter((event) => {
    const key = `${event.segmentIndex}:${event.type}:${event.reference?.canonical ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
async function interpretTranscript(input, language = "ru", {
  corpus,
  ignoreMusic = true,
  ignorePrayer = true
} = {}) {
  const segments = parseTranscript(input);
  const activeCorpus = corpus ?? await loadVerseCorpus(language);
  const explicit = collectExplicit(segments, language, ignorePrayer);
  const matches = matchQuotedVerses(segments, activeCorpus, explicit.contexts, { ignoreMusic, ignorePrayer });
  const events = [...explicit.events, ...quoteEvents(matches, segments, language)];
  expandPartialRanges(events, language);
  resolveNavigation(events, activeCorpus);
  events.push(...deriveReadingBoundaries(events, segments));
  const ordered = uniqueEvents(events);
  const verseKeys = new Set(ordered.flatMap((event) => {
    const reference = event.reference;
    if (!reference?.verseStart) return [];
    const end = reference.verseEnd ?? reference.verseStart;
    return Array.from({ length: end - reference.verseStart + 1 }, (_, index) => `${reference.bookId}:${reference.chapter}:${reference.verseStart + index}`);
  }));
  return {
    language,
    translation: activeCorpus.document.translation,
    corpusId: activeCorpus.document.id,
    segments,
    events: ordered,
    stats: {
      lines: segments.length,
      events: ordered.length,
      uniqueVerses: verseKeys.size,
      references: ordered.filter((event) => event.type === "open" || event.type === "jump").length,
      readings: ordered.filter((event) => event.type === "read").length,
      navigation: ordered.filter((event) => ["advance", "next", "previous", "jump"].includes(event.type)).length
    }
  };
}
function formatConsoleEvent(event) {
  const time = event.timestamp ?? formatClock(event.seconds);
  const reference = event.reference?.canonical ?? "unresolved";
  const confidence = `${Math.round(event.confidence * 100)}%`;
  return `[${time}] ${event.action.padEnd(14)} ${reference} \xB7 ${confidence} \xB7 ${event.basis}`;
}
export {
  VerseCorpusIndex,
  formatConsoleEvent,
  interpretTranscript,
  loadVerseCorpus,
  matchingTokens,
  parseTranscript,
  scoreQuote
};

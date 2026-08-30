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
export {
  BOOKS,
  BibleVerseReferenceDetector
};

# Bible matching corpora

The transcript interpreter lazy-loads one whole-Bible corpus at a time.

- `russyn.json` is the public-domain Russian Synodal Bible from eBible.org.
- `engwebp.json` is the public-domain World English Bible from eBible.org. It is the offline English matching corpus, while the product profile is tuned for the church's NASB-first, multi-translation speech.

Regenerate both files with `npm run build:corpus`. The generated JSON keeps the source URL, translation name, and public-domain status in its metadata.

The NASB text is not bundled. The Lockman Foundation's standard permission permits no more than 1,000 NASB verses in an electronic retrieval system, so a whole-Bible NASB corpus requires separate permission. The interpreter accepts the same corpus schema if a licensed NASB provider is added later.

# Palak's Birthday Finale

A complete static birthday website rebuilt from the supplied reference ZIP using **HTML, CSS and vanilla JavaScript**. It keeps the original five-section journey:

1. Opening
2. The Admiration Problem (Complimentr-powered compliment discovery)
3. The Accidental Exposure
4. Birthday Room (interactive decorations + 16-candle challenge)
5. The Letter

No React, TypeScript, build step, backend, external API or runtime dependency is required. Google Fonts are optional; local fallback fonts are provided.

## Run locally

Because the compliment generator is loaded as a local JavaScript ES module, use a tiny static server rather than opening `index.html` directly with `file://`.

**Python (Windows/macOS/Linux):**

```bash
cd palak_birthday_rebuild
python -m http.server 8000
```

Then open <http://localhost:8000>.

You can also use VS Code Live Server or upload the folder to any static host (GitHub Pages, Netlify, etc.).

## Personalise the content

Edit `js/content.js`:

- `letter`: the paragraphs shown in the final letter section.
- `birthdayMessage`: optional birthday copy for future customisation.

The generator contains **1,200 curated compliments: 150 in each of eight categories**. The guaranteed collection is authored, category-specific and deduplicated; the bundled Complimentr 1.0.10 API is also invoked for a small optional bonus pool. The generator shuffles a deck and does not repeat a compliment until the entire collection is exhausted; then it reshuffles. The category dataset and wording are editable in `js/compliments.js`.

## Complimentr integration and licence note

The bundled file `js/vendor/complimentr.js` is the actual `dist/index.js` from **complimentr 1.0.10**, supplied by the user. Its public API is `generateCompliment(options)`. This rebuild calls that API directly with custom templates and token lists; it does not call an AI service or external API.

The supplied npm tarball's `package.json` says `LGPL-3.0-only`, while the tarball's included `LICENSE` text and the upstream GitHub repository identify the project as **GPL-3.0**. This is an inconsistency in the upstream package metadata. The included copy of the upstream `LICENSE` is in `licenses/COMPLIMENTR-GPL-3.0.txt`, alongside its README. The upstream repository is <https://github.com/alexfiftysix/complimentr>. If you plan to redistribute this project publicly, confirm the intended licence with the package author; this README is not legal advice.

## Audio files you can add

Place your own MP3 files at these exact paths:

```text
assets/audio/song-1.mp3
assets/audio/song-2.mp3
assets/audio/song-3.mp3
assets/audio/song-4.mp3
assets/audio/hissing.mp3
assets/audio/cake-explosion.mp3
```

The website includes **exactly five** music choices: Song 1, Song 2, Song 3, Song 4 and No music. Music only starts after a user selects a track. The selected track persists across section navigation. Missing files are handled without stopping the website.

During a failed candle challenge, the hissing effect starts, background music volume fades down while its playback position continues advancing, the visual explosion happens, and the same track fades back to its normal volume after the aftermath. The cake explosion does not depend on audio files being present. There is intentionally no general mute control for the explosion sound.

## Images

No image assets are required. The room is drawn with CSS and HTML. You may add optional images under `assets/images/` if you later extend the project.

## Birthday countdown

The countdown explicitly uses the `Asia/Kolkata` timezone. It targets November 20 at 00:00 IST. On November 20 (IST), it switches to the birthday-day message instead of counting down to the following day.

## Important implementation notes

- The cake challenge creates exactly 16 candle buttons.
- The challenge deadline is five seconds.
- Success triggers a birthday celebration and confetti.
- Failure triggers a wobble, optional hissing audio, a layered cartoon explosion, fragments, smoke and a short screen shake. The cake remains in an aftermath state until the next attempt.
- Audio playback is user-initiated to respect browser autoplay rules.
- The selected background track is not restarted when navigating between sections.
- All section navigation, compliment generation, decoration placement and the cake challenge work without a backend.

## Folder structure

```text
palak_birthday_rebuild/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── content.js
│   ├── compliments.js
│   └── vendor/
│       └── complimentr.js
├── assets/
│   ├── audio/
│   │   └── README.txt
│   └── images/
│       └── README.txt
└── licenses/
    ├── COMPLIMENTR-GPL-3.0.txt
    └── COMPLIMENTR-README.md
```

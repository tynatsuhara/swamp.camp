# SWAMP CAMP — https://swamp.camp

![preview](publish/images/visitor.gif)

## development

### acquire assets

audio files are stored using [Git LFS](https://git-lfs.github.com/) and can be checked out with `git lfs pull`

### run locally

#### first-time setup

1. Install Git LFS
2. `nvm use && nvm ci`

`npm start` to spin up the Webpack development server!

### formatting

`prettier` is used for formatting — use `npm run format` to format manually

### release

commits to `master` will trigger a [Cloudflare pages deployment](https://dash.cloudflare.com/1f52f961eb89afcf0499eba5f54090d5/pages/view/swamp-camp).

NOTE: Cloudflare pages has a limit of 25MB per file.

#### native app builds

[swamp-camp-electron](https://github.com/tynatsuhara/swamp-camp-electron) is the repo for native builds and releases.

## credits & links

additional art by:

-   https://0x72.itch.io/dungeontileset-ii (robert norenberg, cc0)
-   https://superdark.itch.io/enchanted-forest-characters (cael johnson, cc0)
-   https://superdark.itch.io/16x16-free-npc-pack (cael johnson, cc0)
-   https://anritool.itch.io/cr-tileset (cc0)
-   https://kenney.nl/ (cc0)
-   https://opengameart.org/content/explosion-set-1-m484-games (cc0)

color palette:

-   https://lospec.com/palette-list/nanner-pancakes

font:

-   https://www.1001fonts.com/press-start-2p-font.html#license (free for commercial use)

sound effects & music by:

-   https://www.newgrounds.com/audio/listen/1017053 (brent bunn)
-   https://opengameart.org/content/gt-rpg-soundtrack (juhani junkala)
-   https://www.edinburghrecords.com/
-   https://opengameart.org/content/rpg-sound-pack (cc0)
-   https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud (cc0)
-   https://freesound.org/people/yewbic/packs/2122/ (cc0)
-   https://opengameart.org/content/battle-march-epic-orchestral-music-loop (playonloop.com)
-   https://opengameart.org/content/nature-sounds-pack (Antoine Goumain, cc-by 4.0)
-   https://opengameart.org/content/talking-synthesizer (Thor Arisland, cc-by 4.0)

sound effects & music that might be used in the future:

-   https://opengameart.org/content/swishes-sound-pack (cc0)
-   https://opengameart.org/content/voices-sound-effects-library (cc-by 3.0)

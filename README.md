# Quasar

This is a new experimental AS2 Club Penguin emulator of mine.

# Mediaserver fixes and additions

- For a mediaserver, follow [this](https://solero.github.io/tutorial/legacy/windows#setup-media-server)
- Replace `/media/play/v2/client/igloo.swf` with [igloo.swf](https://solero.me/uploads/default/original/1X/ea48e66c4290fdff2bc6478264acd3dadf3ea844.swf)
- For `openglows`, put [openglows.swf](https://solero.me/uploads/default/original/1X/d6fce44a1a7a1cfa8fba2afbc81db5b102bdf138.swf) into `/media/play/v2/client` and edit `/media/play/v2/client/dependencies.json` by adding ```{id: 'openglows',title: 'openglows'}```

# Running

```
npm start login
npm start world
```

# Known issues

- The disconnect log will appear twice in some special instances (Nothing serious)

# Suggestions or issues?

Don't be scared to make a new issue, even for suggestions! I will try my best and look at everything.

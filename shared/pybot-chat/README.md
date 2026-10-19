# Connect guide chat (offline)

Copied from the Python Lab `shared/pybot-chat` folder (MIT) and adapted for this lab.

The engine quotes `ex` and `eg` from `js/content/connectbot-index.json`. It does not call a model or another origin. The confidence floor stays at BM25 2.4, coverage 2/3, and margin 1.2 or ratio 1.22.

Build the index with:

```
node pipeline/build_connectbot_index.mjs
```

The guide monkey in `guide/guide.js` hosts this chat. There is not a second bot.

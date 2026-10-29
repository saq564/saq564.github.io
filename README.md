# Saqib's portfolio website

Phase 1 of the master plan. Plain HTML, CSS and a little JavaScript: no frameworks, no build step.

## Files
- `index.html`: the content (what's on the page)
- `style.css`: the look. Colours are variables at the top: change `--accent` to recolour the whole site. Light mode swaps the variables. Sections are labelled to match the page.
- `script.js`: all the moving parts, in 15 numbered blocks. The big ones: the living AI network in the intro (10), the "Ask about Saqib" chat with its pre-written answers (12), the hidden terminal (13), and the glowing cursor and magnetic buttons (14)
- `assets/`: put your CV here as `Saqib-CV.pdf`

## See it on your PC
Double-click `index.html` and it opens in your browser. Edit a file, save, refresh.

## Before publishing, replace the placeholders
Search `index.html` for `YOUR-` and fill in:
- `YOUR-EMAIL@example.com`: your email (used by the Copy my email button)
- `YOUR-USERNAME`: your GitHub username (in `index.html`, plus the `contact` terminal command in `script.js`)
- The page loads the Inter font from Google Fonts, so it needs internet to look exactly right
- `YOUR-PROFILE`: your LinkedIn link (same two files)
- Add `assets/Saqib-CV.pdf`

## Publish free on GitHub Pages
1. Create a public repo on GitHub named `YOUR-USERNAME.github.io`
2. Upload these files to it (or `git push` them)
3. Repo Settings, then Pages, then "Deploy from a branch", branch `main`, folder `/ (root)`
4. After a minute the site is live at `https://YOUR-USERNAME.github.io`

## Secrets and extras
- Press the ` key (top left of the keyboard) to open the hidden terminal. Try `help` and `sudo hire-saqib`.
- To change what the chat assistant says, edit the `knowledge` list in block 12 of `script.js`.

## Later
The chat box answers are pre-written for now. When the RAG engine has an API, block 12 will send questions to it instead.

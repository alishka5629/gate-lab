# GATE LAB

An interactive, fully English introduction to four fundamental logic gates: **NOT**, **AND**, **OR** and **XOR**.

## Explore

- Toggle binary inputs and follow the live circuit output.
- Compare every combination in the truth table.
- Read concise explanations and real-world examples.
- Try a five-question quiz with feedback and a restart option.

## Run locally

No package installation or build step is needed. With Python 3 installed:

```sh
python3 -m http.server 8000 --directory docs
```

Open `http://localhost:8000`.

## Verify

With Node.js installed:

```sh
node verify.cjs
```

The checks cover all 14 input combinations, reject invalid inputs, verify local assets and English copy, and check for the restricted CSP and unsafe DOM or network APIs.

## Publish

GitHub Pages serves `docs/` from the `main` branch. All asset URLs are relative, so the application works under a project URL.

## Architecture

The application is static HTML, CSS and JavaScript. It has no application accounts, admin panel, database, uploads or server-side API. Quiz state lives in memory and resets on reload. The CSP restricts resource loading to this origin, forbids inline scripts and evaluation, and disables connections and form submissions. Hosting and GitHub account security remain separate considerations; this is not a claim of invulnerability.

The bundled font is a subset of DejaVu Sans. Its notices and license are in `docs/FONT-LICENSE.txt`.

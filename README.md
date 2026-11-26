# CassetteSpoof

Static web app that generates **GS1 DataMatrix** symbols matching Twiist disposable cassette UDI labels — for reverse-engineering and bench testing only.

**Live:** https://applehat.github.io/CassetteSpoof/

## Disclaimer

**Research only.** Reusing cassettes is **not** approved or supported by Twiist / Sequel Med Tech. This is not medical advice. Do not put a generated label on a cassette worn by a person. Generated symbols are for scanner / app / protocol testing on the bench.

## What it encodes

| AI | Field | Default / notes |
|----|--------|-----------------|
| `(01)` | GTIN | `00850017421431` (DKPI-11073-001 unit-of-use) |
| `(17)` | Expiry | YYMMDD · default ≈ manufacture + 1 year |
| `(21)` | Serial | 15 chars typical: `YYMMDD` manufacture prefix + 9 random digits (e.g. real sample `260610970000295`) |

Real decode from a physical cassette (example):

- `(01) 00850017421431`
- `(17) 270610` → 2027-06-10
- `(21) 260610970000295`

## How to use

1. Open the [Pages site](https://applehat.github.io/CassetteSpoof/) (or `index.html` locally).
2. Confirm / edit GTIN, manufacture date, expiry, and serial.
3. **Regenerate** makes a new serial with the manufacture-date prefix.
4. Hold a phone close to the on-cassette DataMatrix preview to scan.

Encoding uses [bwip-js](https://github.com/metafloor/bwip-js) `gs1datamatrix` (proper GS1 / FNC1 mode) from a CDN — no build step.

## Local

```bash
# any static server, or just open index.html
python3 -m http.server -d . 8080
```

## Related

- [applehat/reversing-twiist](https://github.com/applehat/reversing-twiist) — protocol RE notes (cassette UDI fields documented there)
- [applehat/TwiistOff](https://github.com/applehat/TwiistOff) — bonded Android debug client

## License

MIT — use at your own risk; research / educational context only.

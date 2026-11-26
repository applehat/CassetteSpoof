# CassetteSpoof

Static web app that generates **GS1 DataMatrix** symbols matching Twiist disposable cassette UDI labels — for reverse-engineering and bench testing only.

**Live:** https://applehat.github.io/CassetteSpoof/

## Disclaimer

CassetteSpoof is a small hobby project for generating GS1 DataMatrix labels. It isn't affiliated with Sequel, it isn't FDA approved, and putting a regenerated code on a cassette you've already used is off-label and unsupported by the manufacturer. Insulin delivery is life-critical, so please make your own informed decision and talk with your care team. We believe individual patient choice matters, but you alone are responsible for how you use this tool, and the author is not liable for any harm, loss, or damage that comes from using it.

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

Encoding is concatenated GS1 (`01008500174214311727061021260610970000295` for that sample) via [bwip-js](https://github.com/metafloor/bwip-js) `gs1datamatrix`.

## How to use

1. Open the [Pages site](https://applehat.github.io/CassetteSpoof/) (or `index.html` locally).
2. The first screen is just the cassette, a large DataMatrix, **Regenerate**, and **Customize**.
3. Hold a second phone up to the on-cassette symbol. The matrix is sized to stay scannable (~280–360 CSS px).
4. **Regenerate** mints a new serial (and refreshes manufacture/expiry to a valid 1-year gap if the current dates are stale). It does not open Customize.
5. **Customize** expands GTIN, dates, serial, and guidelines.

## Local

```bash
# any static server, or just open index.html
python3 -m http.server -d . 8080
```

## License

MIT — use at your own risk; research / educational context only.

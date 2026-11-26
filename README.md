# CassetteSpoof

Static web app that generates **GS1 DataMatrix** symbols matching Twiist disposable cassette UDI labels — for reverse-engineering and bench testing only.

**Live:** https://applehat.github.io/CassetteSpoof/

## Disclaimer

CassetteSpoof is a small hobby project for generating GS1 DataMatrix labels. It isn't affiliated with Sequel, it isn't FDA approved, and putting a regenerated code on a cassette you've already used is off-label and unsupported by the manufacturer. Insulin delivery is life-critical, so please make your own informed decision and talk with your care team. We believe individual patient choice matters, but you alone are responsible for how you use this tool, and the author is not liable for any harm, loss, or damage that comes from using it.

## What we think happens

Based on analysis of the official app's own stored data (event database + logs), here is our current, best-guess understanding of what the app does with a scanned cassette code:

1. The app reads the GS1 DataMatrix &mdash; `(01)` GTIN, `(17)` expiry, `(21)` serial &mdash; and stores an `EV_CASSETTE_SCAN` record locally on the phone.
2. The **"Cassette Already Used"** rejection appears to be **local**: the app compares a new scan against serials it has already seen on that device. We saw no evidence of a live cloud check during the scan itself.
3. **But** every app event in the backup we looked at &mdash; including cassette scans &mdash; was marked uploaded. So the scanned code (GTIN + expiry + serial) is **most likely synced to Sequel's cloud** whenever the phone has internet. We have not observed the upload payload verbatim and we cannot see Sequel's backend, so this is an inference, not a certainty.

**What that means for you:** if you scan a generated code while the phone is online, **assume Sequel ends up with a record of that serial tied to your account**. Only the serial distinguishes cassettes (the GTIN is shared by all of them); generated serials are random, so they should not collide with anyone else's real unused cassette. If the record bothers you, scan with the phone offline (the used-check itself looks local), or accept that the record exists. This is bench tooling for water-fill reuse &mdash; not therapy and not on a person.

See the reverse-engineering notes for the underlying evidence.

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

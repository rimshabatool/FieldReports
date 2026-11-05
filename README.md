# Field Reports

A React Native field-reporting app: compose a short description plus 1–5 photos, keep work safe on the phone when the network is bad, and deliver each report to the server unattended — then review what the server actually holds.

## 1. App Setup

```bash
npm install
npm start
npm run ios      # or: npm run android
```

## 2. Backend Setup

This repo includes a small Express server in `server/` (port **8787**). It accepts multipart report uploads and serves the Received list.
if you are test it emulator and simulator

```bash
cd server
npm install
npm start
```

## 4. Test on a physical device (APK)

1. Start the server on your laptop: `cd server && npm start`
2. Find your laptop’s Wi‑Fi IP (e.g. `192.168.18.107`)
3. Set that URL in `src/upload/config.ts`, e.g. `http://192.168.18.107:8787`
4. Build and install the APK on the phone
5. Keep the phone and laptop on the **same Wi‑Fi**
6. Open the app and send a report / check Received
   Use `10.0.2.2` only for the Android emulator — not for a real phone.

## 3. How to Simulate Failures

```bash
ccurl -X POST http://127.0.0.1:8787/fail-mode -H 'Content-Type: application/json' -d '{"mode":"slow"}'
curl -X POST http://127.0.0.1:8787/fail-mode -H 'Content-Type: application/json' -d '{"mode":"drop"}'
curl -X POST http://127.0.0.1:8787/fail-mode -H 'Content-Type: application/json' -d '{"mode":"refuse"}'
curl -X POST http://127.0.0.1:8787/fail-mode -H 'Content-Type: application/json' -d '{"mode":"hang"}'
```

## 4. Technical and UI/UX Decisions

- **Why this UI?** AI-generated layout, lightly customized for a simple field-first flow (Compose → Outbox → Received).
- **Why this backend?** Small local Express server — easy to run, multipart uploads, Received list, and fail-mode testing without a cloud stack.
- **Offline storage and upload queue** Photos + `queue.json` on the filesystem via `react-native-blob-util` (not MMKV) so binary images and the queue stay durable together; the uploader drains the queue when NetInfo says we’re online.
- **Image compression** Photos are compressed with `react-native-compressor` until each file is under the 5 MB server limit.
- **Reset behavior** “Clear this phone” aborts uploads and deletes only local queue/photos; reports already on the server are kept.

## 5. What I Would Improve With Another Day

Things the brief mentioned as free / out of scope that I would add next if I had more time:

- Login / accounts
- Delivery feedback on success — a short in-app confirmation when a report reaches the server (not push; the brief keeps push out of scope)
- Edit or delete a report after it has already uploaded
- Map / location on a report
- Video in addition to photos
- A hosted backend (instead of the local Express test server)

## 6. Known Limitations and What I Left Out

Everything is done almost. No Left Out.

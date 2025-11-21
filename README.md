# Liveness Cam

A cross-platform Liveness Detection Camera application built with Electron (Desktop) and Capacitor (Android).
![image](/docs/assets/demo.gif)
## Features

-   **Cross-Platform**: Runs on macOS/Windows (Electron) and Android (Capacitor).
-   **Customizable Sequence**: Drag and drop color chips to configure the capture sequence.
-   **Liveness Detection**: Flashes colors (White, Red, Yellow, Blue, Green) on the screen while capturing photos.
-   **Brightness Control**: Automatically maximizes screen brightness during capture for optimal lighting.
-   **File Management**: Saves captured photos to the device's Documents folder (Android) or local file system (Desktop).

## Tech Stack

-   **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES Modules)
-   **Bundler**: Vite
-   **Mobile Runtime**: Capacitor (Camera, Filesystem, Screen Brightness)
-   **Desktop Runtime**: Electron

## Installation & Development

### Prerequisites

-   Node.js (v16+)
-   Android Studio (for Android build)

### Setup

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd alc_electron
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running on Desktop (Electron)

```bash
npm start
```

### Building for Android

1.  **Build Web Assets**:
    ```bash
    npm run build
    ```

2.  **Sync with Capacitor**:
    ```bash
    npx cap sync
    ```

3.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
    From Android Studio, click the **Run** button to build and deploy to your connected device or emulator.

## Project Structure

```
alc_electron/
├── src/
│   ├── modules/          # Logic modules (Camera, Brightness, UI, DnD)
│   └── renderer.js       # Main frontend logic
├── android/              # Android native project
├── dist/                 # Compiled web assets (Vite output)
├── main.js               # Electron main process
├── preload.js            # Electron preload script
├── index.html            # Entry point
├── styles.css            # Global styles
└── vite.config.js        # Vite configuration
```

## Troubleshooting

-   **Camera Permission Denied**: On Android, ensure you grant camera permissions when prompted. If denied, go to **Settings > Apps > Liveness Cam > Permissions** and enable Camera.
-   **White Screen on Start**: Ensure you have run `npm run build` before syncing to Android.

## License

MIT

# Electron Liveness Detection App Walkthrough

## Overview
This application demonstrates a liveness detection-style camera interface. It cycles through 5 background colors (White, Red, Yellow, Blue, Green) and captures a photo for each color.

## Features
- **Start Screen**: Simple start button.
- **Camera Preview**: Fullscreen camera feed with a mirrored view.
- **Overlay**: An elliptical transparent cutout with a colored background mask.
- **Auto-Capture**: Automatically cycles colors every 0.5s and saves photos.
- **Session Storage**: Photos are saved in timestamped subdirectories within the `photos` folder.
- **Brightness Control**: Automatically maximizes screen brightness during capture and restores it afterwards.
- **Toast Notification**: Displays a "Sequence Complete" message upon completion.

## How to Run
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start the App**:
   ```bash
   npm start
   ```

## Usage
1. Click the **Start** button.
2. Grant camera permissions if prompted.
3. Screen brightness will increase to maximum.
4. Position your face within the elliptical frame.
5. The screen will flash through 5 colors.
6. After the sequence:
   - Brightness restores to original level.
   - App returns to the start screen.
   - A "Sequence Complete" toast message appears.
7. Check the `photos` folder to see the captured images organized by session.

## Project Structure
- `main.js`: Electron main process, handles file saving and brightness control.
- `renderer.js`: Handles camera access, UI updates, sequencing, and brightness logic.
- `styles.css`: CSS for the overlay, layout, and toast notifications.
- `index.html`: Main entry point.

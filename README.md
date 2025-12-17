# Lyric Video Generator

A modern, browser-based tool to create animated lyric videos instantly. Built with React, Vite, and Tailwind CSS.

![Lyric Video Generator Preview](https://github.com/user-attachments/assets/c6e52d29-b8a0-480f-a124-3838ea35dfa1)



## Features

*   **Instant Preview:** See your changes in real-time.
*   **Customizable Styles:**
    *   Change background (Solid Color, Image, Transparent).
    *   Adjust font family (including Cursive), size, color, and style (Bold/Italic).
    *   Control text position and timing.
*   **Smart Timing:** Automatically calculates duration based on character count.
*   **Silence Control:** Use `_` on a new line to insert a 1-second pause.
*   **Export:**
    *   Export as `.webm` video.
    *   Customizable quality (High, Medium, Low).
    *   Multiple aspect ratios (16:9, 9:16, 1:1).
    *   Custom file naming.
*   **Mobile Friendly:** Fully responsive design for creating on the go.
*   **Text-to-Speech:** Optional browser-native TTS for accessibility or fun.

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/lyrics-generator.git
    cd lyrics-generator/web_app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in browser:**
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

## Usage Tips

*   **Lyrics:** Paste your lyrics one line per screen.
*   **Pauses:** To add a blank screen for 1 second, just type a single underscore `_` on a line.
*   **Images:** You can upload a custom background image.
*   **Export:** Click "Export Video" to save your creation. Note that export happens in real-time playback speed.

## Technologies

*   [React](https://reactjs.org/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Lucide React](https://lucide.dev/) (Icons)

## License

MIT

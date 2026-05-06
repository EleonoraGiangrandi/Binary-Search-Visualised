# Binary Search Visualization

A high-quality educational animation explaining Binary Search vs. Linear Search, built using [Motion Canvas](https://motion-canvas.github.io/).

## Watch the Video

📽️ **[Watch the full visualization on YouTube](https://youtu.be/j5vZWmoEJ5s)**

## Features

- **Side-by-Side Comparison**: Visualizes the efficiency difference between Linear and Binary Search.
- **Dynamic Counters**: Real-time "guess" tracking during the search process.
- **Interactive UI**: Custom-built UI components with smooth transitions and glassmorphism-inspired effects.
- **Color Palette**: A curated high-contrast palette for maximum clarity.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [FFmpeg](https://ffmpeg.org/) (optional, required for direct MP4 export)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/binary-search-video.git
   cd binary-search-video
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To open the Motion Canvas editor and preview the animation:

```bash
npm run serve
```

Then open [http://localhost:9000](http://localhost:9000) in your browser.

## Exporting

1. Open the editor UI.
2. Navigate to the **Video Settings** tab (camera icon on the left sidebar).
3. Select **FFmpeg** in the rendering section.
4. Click **RENDER**.
5. The final video will be saved in the `output/` directory.

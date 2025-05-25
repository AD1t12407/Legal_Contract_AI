import { defineConfig } from 'vite';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom plugin to copy manifest.json and asset files
const copyExtensionAssetsPlugin = () => ({
  name: 'copy-extension-assets',
  closeBundle: () => {
    // Copy manifest.json
    fs.copyFileSync(
      path.resolve(__dirname, 'chrome-extension/manifest.json'),
      path.resolve(__dirname, 'chrome-extension/dist/manifest.json')
    );
    
    // Create icons directory if it doesn't exist
    const iconsDir = path.resolve(__dirname, 'chrome-extension/dist/icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    // Copy icons if they exist
    try {
      const iconSizes = [16, 48, 128];
      iconSizes.forEach(size => {
        const iconPath = path.resolve(__dirname, `chrome-extension/icons/icon${size}.png`);
        if (fs.existsSync(iconPath)) {
          fs.copyFileSync(
            iconPath,
            path.resolve(__dirname, `chrome-extension/dist/icons/icon${size}.png`)
          );
        }
      });
    } catch (e) {
      console.warn('Could not copy icon files. They may not exist yet.');
    }
    
    // Copy HTML files to the root of dist
    const htmlFiles = ['popup.html', 'learning.html'];
    htmlFiles.forEach(file => {
      const sourcePath = path.resolve(__dirname, `chrome-extension/dist/chrome-extension/${file}`);
      const destPath = path.resolve(__dirname, `chrome-extension/dist/${file}`);
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
      }
    });

    // Copy CSS and JS files to the root of dist if not already there
    const assetFiles = ['popup.css', 'learning.css', 'learning.js', 'popup.js'];
    assetFiles.forEach(file => {
      const sourcePath = path.resolve(__dirname, `chrome-extension/${file}`);
      if (fs.existsSync(sourcePath) && !fs.existsSync(path.resolve(__dirname, `chrome-extension/dist/${file}`))) {
        fs.copyFileSync(
          sourcePath,
          path.resolve(__dirname, `chrome-extension/dist/${file}`)
        );
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'chrome-extension/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'chrome-extension/popup.html'),
        learning: path.resolve(__dirname, 'chrome-extension/learning.html'),
        background: path.resolve(__dirname, 'chrome-extension/background.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  plugins: [
    copyExtensionAssetsPlugin()
  ]
});
# Icon Generation Instructions

Since we need actual PNG files for the icons, you have two options:

## Option 1: Use Your Existing Logo (Recommended)

If you have the Christ University logo as a PNG file:

1. Rename your logo file to generate these sizes:
   - `icon-72x72.png` (72x72 pixels)
   - `icon-96x96.png` (96x96 pixels)
   - `icon-128x128.png` (128x128 pixels)
   - `icon-144x144.png` (144x144 pixels)
   - `icon-152x152.png` (152x152 pixels)
   - `icon-192x192.png` (192x192 pixels)
   - `icon-384x384.png` (384x384 pixels)
   - `icon-512x512.png` (512x512 pixels)

2. Use an online tool like:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - Or use your existing `christunifavcion.png` and resize it

3. Place all generated icons in the `/public` folder

## Option 2: Quick Setup (Use Existing Favicon)

For now, you can copy your existing favicon multiple times with different names:

```bash
# In PowerShell (Windows)
cd public
copy christunifavcion.png icon-72x72.png
copy christunifavcion.png icon-96x96.png
copy christunifavcion.png icon-128x128.png
copy christunifavcion.png icon-144x144.png
copy christunifavcion.png icon-152x152.png
copy christunifavcion.png icon-192x192.png
copy christunifavcion.png icon-384x384.png
copy christunifavcion.png icon-512x512.png
```

This will work temporarily, but for production, use properly sized icons.

## Option 3: Use PWA Builder (Best Quality)

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your Christ University logo (high resolution recommended)
3. Download the generated icon package
4. Extract all icons to your `/public` folder
5. They'll have the correct names and sizes

---

**Note:** Icons are required for the PWA to be installable on all devices.

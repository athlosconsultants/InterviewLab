HERO BACKGROUND IMAGE REQUIREMENTS
=====================================

File Location:
--------------
Place the hero background image at: /public/images/hero-bg.jpg

Image Specifications:
---------------------
- Format: JPG (primary), WebP (optional for better compression)
- Recommended dimensions: 1920x1080 or larger
- Aspect ratio: 16:9 or wider landscape format
- Subject: Abstract blue landscape or similar
- Optimization: Compress for web (target < 200KB for JPG)
- Color scheme: Should complement cyan-blue branding (#0EA5E9, #06B6D4)

The image will be displayed:
- Mobile: 30vh height
- Tablet: 35vh height
- Desktop: 45vh height

With a gradient overlay fading to light blue (#E0F2FE) for seamless integration.

Next.js Image Optimization:
---------------------------
The implementation uses Next.js Image component which automatically:
- Creates WebP versions for supported browsers
- Optimizes image size and quality
- Provides responsive image sizing
- Lazy loads when appropriate (this hero uses priority loading)

If you need to add a WebP version manually:
- Place at: /public/images/hero-bg.webp
- The browser will automatically use WebP if available

# Hadeon

Hadeon is a premium agency website built with HTML, CSS, and JavaScript. The project focuses on a dark editorial visual style, animated CTA interactions, a scroll-based offer stack, a solutions video section, FAQs, and a custom contact page.

## Project Structure

- `pages/index.html`
  Main homepage layout.
- `pages/contact.html`
  Contact page layout.
- `css/styles.css`
  Global styling for the homepage and contact page.
- `js/main.js`
  Interactive behavior for buttons, video controls, stat count-up, and the offer stack scroll effect.
- `assets/`
  SVGs, logos, and supporting visual assets.
- `images/`
  Backgrounds and section imagery.
- `video/`
  Local video files used in the site.

## Features

- Editorial hero section with animated CTA button
- Solutions section with autoplay video and custom overlay controls
- Animated metrics and statistics
- Scroll-driven stacked service cards
- CTA banner with themed background artwork
- FAQ accordion section
- Custom footer
- Dedicated contact page

## Running Locally

This is a static site, so you can run it with any simple local server.

Examples:

```powershell
cd C:\Users\David\Desktop\hadeon
python -m http.server 8000
```

Then open:

- `http://localhost:8000/pages/index.html`
- `http://localhost:8000/pages/contact.html`

You can also open the HTML files directly in a browser, but a local server is better for media loading and path consistency.

## Notes

- The site uses the Satoshi font from Fontshare.
- Media paths are currently local to this repository.
- Interactive behavior is written in vanilla JavaScript with no framework dependency.

## Git

The repository is connected to:

- [https://github.com/David225-sudo/hadeon.git](https://github.com/David225-sudo/hadeon.git)

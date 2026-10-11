# Aftermath Maintenance — Website

Static website: `index.html`, `style.css`, `script.js` and an `assets/` folder. No build tools, frameworks or backend are needed.

## 1. Test locally
- Double-click `index.html` to open it in a browser. Everything works offline except the Google Fonts (it falls back to system fonts).
- For a closer match to real hosting, run a local server in this folder: `python -m http.server 8000`, then open http://localhost:8000.
- Check these: the menu links, the mobile menu (make the window narrow), the project filters, the photo viewer (arrow keys, Esc, swipe on a phone), and the form errors.

## 2. Image placement guide
All 38 photos from the Aftermath folder are used. They were resized to a maximum of 1600px and saved as JPEG in `assets/`.

The **Projects gallery is grouped by project**. Each card shows a cover photo and a photo count. Clicking a card opens the viewer with every photo from that project, a row of thumbnails and a "Completed" or "In progress" label on each photo. The arrows carry on into the next project.

| Project card | Photos (in `assets/`) |
|---|---|
| Timber Kitchen & Living Space (large card) | kitchen-timber-counter, -wide, -2, -3, -4, -detail, living-room-timber-ceiling |
| Black Kitchen Cabinetry | kitchen-black-cabinetry |
| White Kitchen Cabinetry | kitchen-cabinetry, kitchen-cabinetry-sink |
| Tiled Veranda Corridor | tiled-corridor-finished, -finished-2, -in-progress, -in-progress-2 |
| Walk-in Shower Bathroom | bathroom-walk-in-shower, bathroom-in-progress |
| Room with Balcony Doors | room-sliding-door-pendant |
| Interior Room Finishing | room-interior-finishing |
| Timber Roof Framing & Carpentry | roof-framing-carpentry, roof-framing-door-install |
| Hillside Rock Wall & Site Works | site-retaining-wall-aerial, team-rock-wall |
| Block Work, Rendering & Screed | construction-workers-plastering, floor-screed-in-progress |
| Two-Storey Home Exterior (wide card) | house-exterior-finished, house-exterior-scaffolding, -2, -3, -4, -ladder |
| Hillside Home Gutters & Exterior | exterior-painting-scaffolding |
| Commercial Canopy Structure | commercial-canopy-finished, commercial-canopy-painting, -painting-2 |
| Office Building & Fit-Out | office-building-exterior, office-interior-finished, office-interior, office-fitout-in-progress |

Photos used outside the gallery:
- **Hero:** house-exterior-finished and house-exterior-scaffolding
- **About:** team-rock-wall and room-sliding-door-pendant
- **Service cards:** roof-framing-carpentry, tiled-corridor-finished-2, kitchen-timber-counter-2, exterior-painting-scaffolding
- **Call-to-action background:** kitchen-timber-counter
- **Instagram strip:** six photos from the gallery
- **Logo files:** logo.png, logo-mark.png, favicon.png
- **Share preview:** og-image.jpg, a 1200×630 crop used when the link is shared

**To add a photo to a project:** in `index.html`, find that project's `data-photos='[...]'` list. Add `{"src": "assets/new.jpg", "alt": "...", "status": "Completed", "caption": "..."}`. Use `&quot;` in place of `"` inside the attribute, the same way the existing entries are written.

**To add a new project:** copy one whole `<li class="g-item">…</li>` block and edit it.

## 3. Update contact details
The phone number, email and Instagram link appear in many places in `index.html`. Search and replace:
- `+2482544722` (used in tel: links) and `+248 2 544 722` (the displayed number)
- `aftermathmaintenance140@gmail.com`
- `https://www.instagram.com/aftermath_maintenance/`

Also update the `SITE_CONFIG` block at the top of `script.js` and the JSON-LD block in the `<head>` of `index.html`.

**WhatsApp:** this is turned off because the number has not been confirmed as a WhatsApp number. Once it is confirmed, set `whatsappEnabled: true` in `script.js`. A green WhatsApp button will then appear in the Contact section and at the bottom-right of the page.

**Budget ranges:** the SCR ranges in the "Estimated Budget" dropdown are placeholders. Edit them in `index.html` to suit the business.

## 4. Connect the form to a real backend
The form is in demo mode right now. Nothing is sent. Visitors see a clear "enquiry not sent" message, plus a button that opens their email app with all their details filled in, and a call button.

To receive enquiries by email (Formspree example):
1. Create a free account at https://formspree.io and make a new form that sends to `aftermathmaintenance140@gmail.com`.
2. Copy the endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. In `script.js`, set `formEndpoint: 'https://formspree.io/f/abcdwxyz'`.
4. Send a test enquiry and confirm it arrives. The success message only appears when the service accepts the submission. If sending fails, visitors see an error with the email and phone options.

Getform, Basin and similar services that accept JSON POST requests work the same way.

## 5. Deploy (static hosting)
- **Netlify:** drag the whole `aftermath-maintenance` folder onto https://app.netlify.com/drop.
- **GitHub Pages:** push the folder contents to a repository, then go to Settings → Pages → Deploy from branch → `main` / root.
- **Cloudflare Pages / Vercel:** import the repository with no build command and an output directory of `/`.

After you connect a domain, change the `og:image` URL in `index.html` to an absolute URL, e.g. `https://yourdomain.sc/assets/og-image.jpg`. Some social networks need this to show the preview image.

## Notes on content
- No street address, opening hours, founding year, reviews or certifications are included, because none were provided.
- Photos taken during work are labelled "In progress".
- The commercial canopy photos show a tenant's DHL/F1 signage. Confirm the client is happy for these to be shown, or swap in other photos.

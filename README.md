# BNB Tents website

Static one-page site for BNB Tents (Horseheads, NY). No build step: edit the files and reload.

- `index.html`: page content
- `assets/css/site.css`: styles
- `assets/js/config.js`: phone, email, quote-form key, booking link
- `assets/img/`: photos (cropped from `../marketing/BNB1.png`), logo, icons, share image

## Preview locally

    python3 -m http.server 8080

then open http://localhost:8080 (or http://<this-mac's-IP>:8080 from a phone on the same Wi-Fi).

## Quote form

Set `web3formsKey` in `assets/js/config.js` (free at https://web3forms.com, keyed to the inbox
that should receive leads). Until then the form opens the visitor's email app with the request filled in.

## Booking

Set `bookingUrl` to a Calendly / Cal.com / Google appointment link to show a "Book a time to talk" button.

## Deploy

Push to `main` on GitHub; `.github/workflows/pages.yml` publishes the site with GitHub Pages
(Settings > Pages > Source: GitHub Actions). For a custom domain, add it in Settings > Pages and point
the registrar's DNS at GitHub (A records 185.199.108-111.153, `www` CNAME to `<org>.github.io`).

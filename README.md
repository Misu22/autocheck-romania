# AutoCheck România — prototip web

## Funcții incluse
- Introducere manuală a VIN-ului.
- Selectarea unei fotografii sau deschiderea camerei pe telefoanele compatibile (`capture="environment"`).
- Citire OCR în browser cu Tesseract.js; utilizatorul trebuie să verifice seria recunoscută.
- Validare de bază a formatului VIN (17 caractere, fără I/O/Q).
- Decodificare tehnică opțională prin API-ul public NHTSA vPIC.

## Limitări importante
- NHTSA vPIC este orientat în principal către vehiculele pentru piața SUA; rezultatele pentru mașini europene pot fi incomplete.
- Nu există în acest prototip o bază gratuită universală de daune, kilometraj sau fotografii istorice. Nu se inventează astfel de date.
- OCR-ul poate greși; confirmarea manuală a VIN-ului este obligatorie.
- Tesseract.js este încărcat de pe CDN, iar decodificarea VIN necesită internet.
- Fotografia este procesată în browser; nu este încărcată de acest cod pe un server propriu.

## Publicare gratuită
Poți încărca fișierele `index.html`, `style.css` și `app.js` într-un repository GitHub și activa GitHub Pages, sau le poți importa într-un proiect Vercel. Nu este necesar un cont Google Play pentru versiunea web.

Deschide `index.html` local pentru o verificare rapidă; pentru testarea API-ului și a camerei este recomandat HTTPS sau localhost.

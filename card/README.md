# My Card

My digital business card. This is the web version of my business card. Treat `card/` as a completely independent mini-site.

```text


```


## Structure

```text
dr-nick-nagel.github.io/

    index.html
    ...

    card/
    ├── index.html      <-- front
    ├── back.html       <-- back
    ├── css/
    │   └── style.css
    ├── js/
    │   └── card.js
    ├── svg/
    │   └── logo.svg    <-- placeholder
    └── assets/
        └── qr.png      <-- replace later

```


## Single Source Branding --> Multi Platform Publishing

The card starts small but evolves into branding across web, screens, business card, book covers, etc..

It's a single source of truth that is single source muli-platform publishable.


```text
            Master SVG
                │
    ┌───────────┼────────────┐
    │           │            │
Website      Business     Book covers
            Card
    │           │
Animated      PDF
    │           │
PNG/WebP    Print shop

```

You can design an SVG composition that's exactly the size of a business card: *BusinessCard.svg*

```text
SVG
 ↓
PDF (for printer)
 ↓
PNG (for previews)
 ↓
HTML (embedded directly)
```

## The Digital Version

Imagine someone visits: `https://nicknagel.com/card` 

Instead of seeing a photograph of a business card they see the living version:

The logo gently moves.
The sea slowly swells.
The North Star twinkles.
The QR code is still there.
Your contact links are clickable.

...

Books rotate into view.
Recent blog posts appear.

#### It's the same composition—but interactive.

- lean heavily into SVG

Imagine landing on the page...
- The logo slowly draws itself.
- The wave gently moves.
- Nothing flashy
- No scrolling
- Just elegance


Very much like the opening page of one of your books...

___
RESUME HERE
https://chatgpt.com/c/6a4ed01a-abdc-83ea-8460-158b959d9c1d


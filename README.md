# SiteBatch

A construction-site batching assistant for tracking concrete mix ratios, bucket counts, batch progress, and common civil engineering unit conversions.

## About

SiteBatch was inspired by a real problem I encountered during my civil engineering internship.

On site, we often had to monitor the amount of cement, granite, and sand being added to a concrete mixer according to a specific mix ratio. For example, with a **1:2:4** ratio, we would need to keep track of 1 bag of cement, 2 buckets of granite, and 4 buckets of sand.

Manually counting each bucket while materials are being poured can be tiring and makes it easier to lose count.

SiteBatch provides a simple digital counter where each material can be recorded with a button as it is added to the mixer.

## Features

* Track cement, granite, and sand quantities
* Support common concrete mix ratios
* Custom mix ratio input
* Live batch progress tracking
* Material completion indicators
* Undo the last material count
* Reset the current batch
* Save completed batches to history
* Clear saved batch history
* Keyboard shortcuts for faster counting
* Civil engineering unit converter
* Length, area, volume, mass, force, and pressure conversions
* Light and dark themes
* Responsive design for desktop and mobile
* Data persistence using `localStorage`

## Mix Ratio Tracking

SiteBatch currently supports common ratios such as:

* `1 : 2 : 4`
* `1 : 5 : 7`
* `1 : 4 : 8`
* Custom ratios

The material order used by the application is:

**Cement : Granite : Sand**

For example:

```text
1 : 4 : 8

Cement  → 1
Granite → 4
Sand    → 8
```

The application tracks each material individually and shows how many buckets remain before the required quantity is reached.

## Unit Converter

The built-in converter supports several units commonly used in civil engineering.

### Length

* Millimetre
* Centimetre
* Metre
* Kilometre
* Inch
* Foot
* Yard

### Area

* mm²
* cm²
* m²
* km²
* ft²
* yd²

### Volume

* cm³
* m³
* Litre
* Millilitre
* ft³
* yd³

### Mass

* Milligram
* Gram
* Kilogram
* Tonne
* Pound

### Force

* Newton
* Kilonewton
* Kilogram-force

### Pressure

* Pascal
* Kilopascal
* Megapascal
* N/mm²
* N/m²
* Bar
* psi

## Keyboard Shortcuts

| Key | Action          |
| --- | --------------- |
| `1` | Add cement      |
| `2` | Add granite     |
| `3` | Add sand        |
| `Z` | Undo last count |
| `R` | Reset batch     |

Keyboard shortcuts are disabled while typing inside an input or select field.

## Built With

* HTML5
* CSS3
* JavaScript
* LocalStorage
* CSS Variables
* Responsive CSS
* Unsplash image

## Project Structure

```text
SiteBatch/
│
├── index.html
├── styles.css
├── script.js
└── README.md
```

## How It Works

1. Select a predefined mix ratio or enter a custom ratio.
2. Start the batch counter.
3. Tap the corresponding material button whenever a bucket is added to the mixer.
4. Monitor the live count and remaining quantities.
5. When all required materials have been counted, the batch is automatically saved to history.
6. Use the unit converter whenever a civil engineering unit needs to be converted.

## Author

**Abass A.**


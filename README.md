# Centroider

Centroider is a Javascript thinger for calculating the centroids and areas of SVG shapes.

It will also calculate the hang holes to make a balanced hanging mobile.

## Installation

The intended javascript version is in `.node-version`.

```bash
npm install
```

## Usage

You need to build an SVG file that has one group at the root with the id of `"shapes"`. All `<path>` elements nested as direct children of the shapes group will be used.

When creating the hang holes for mobiles, it is assumed that the SVG is at 72dpi.

```xml
<svg>
  <g id="shapes">
    <path />
    <path />
  </g>
</svg>
```

## Todo

- [ ] support circles and rectangles in addition to path elements
- [ ] make a CLI
- [ ] separate the mobile balancer code from the centroid/area annotation code and be able to run each separately
- [ ] resize the final outputted SVG to fit the laid out mobile

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
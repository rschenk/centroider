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

You can provide your own holes for the right-most hang hole (where the next mobile down hangs from). These must be in another group at the root with the id of `"hangHoles"`. The center of the bounding box will be used as the coordinates of the hole. These coordinates must be contained within a shape.

When creating the hang holes for mobiles, it is assumed that the SVG is at 72dpi.

```xml
<svg>
  <g id="shapes">
    <path />
    <path />
  </g>
  
  <!-- optional, provide your own hang holes -->
  <g id="hangHoles">
    <path />
  </g>
</svg>
```

## Todo

- [x] support circles and rectangles in addition to path elements
- [x] resize the final outputted SVG to fit the laid out mobile
- [x] can provide your own "down" hang hole
- [x] make a CLI
- [ ] separate the mobile balancer code from the centroid/area annotation code and be able to run each separately

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)


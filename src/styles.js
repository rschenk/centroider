const Glowforge = {
  black: '#000',
  darkBlue: '#0072B2',
  darkGreen: '#009E73',
  lightBlue: '#56B4E9'
}

const Gray = {
  light: '#ccc',
  medium: '#999',
  dark: '#555'
}

const outlined = {
  strokeWidth: 1,
  fillColor: null
}

const iterate = {
  shape: {
    ...outlined,
    strokeColor: Glowforge.black
  },

  hangHole: {
    ...outlined,
    strokeColor: Glowforge.darkBlue
  },

  hangHolePadding: {
    ...outlined,
    strokeColor: Gray.light
  },

  string: {
    ...outlined,
    strokeColor: Gray.dark
  },

  centroid: {
    ...outlined,
    strokeColor: '#f00'
  },

  text: {
    fillColor: '#000',
    strokeColor: null,
    fontFamily: 'Avenir Next',
    justification: 'center'
  }
}

const display = {
  shape: {
    ...outlined,
    strokeColor: Glowforge.black
  },

  hangHole: {
    ...outlined,
    strokeColor: Glowforge.black
  },

  hangHolePadding: {
    ...outlined,
    strokeColor: Gray.light
  },

  string: {
    ...outlined,
    strokeColor: Gray.dark
  }
}

const laser = {
  shape: {
    ...outlined,
    strokeColor: Glowforge.darkBlue
  },

  hangHole: {
    ...outlined,
    strokeColor: Glowforge.black
  }
}

module.exports = { iterate, display, laser }

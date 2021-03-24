const Glowforge = {
  black: '#000',
  darkBlue: '#0072B2',
  darkGreen: '#009E73',
  lightBlue: '#56B4E9',
}

let outlined = {
  strokeWidth: 1,
  fillColor: null
}

module.exports = {
  shape: {
    ...outlined,
    strokeColor: Glowforge.black
  },

  hole: {
    ...outlined,
    strokeColor: Glowforge.darkBlue,
  },

  line: {
    ...outlined,
    strokeColor: Glowforge.lightBlue
  },
  
  string: {
    ...outlined,
    strokeColor: '#000'
  }

}

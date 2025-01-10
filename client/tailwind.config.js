module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    textFillColor: theme => theme('borderColor'),
    textStrokeColor: theme => theme('borderColor'),
    textStrokeWidth: theme => theme('borderWidth'),
    paintOrder: {
      'fsm': { paintOrder: 'fill stroke markers' },
      'fms': { paintOrder: 'fill markers stroke' },
      'sfm': { paintOrder: 'stroke fill markers' },
      'smf': { paintOrder: 'stroke markers fill' },
      'mfs': { paintOrder: 'markers fill stroke' },
      'msf': { paintOrder: 'markers stroke fill' },
      'sf': { paintOrder: 'stroke fill' },
    },
    extend: {
      fontFamily: {
        marker: ['Permanent Marker', 'cursive'],
        brandy: ['Brandy', 'cursive'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        kalam: ['Kalam', 'cursive'],
      },
      colors: {
        'primary-color': '#FF3A6C',
        'dark-primary-color': '#FD73058'
      },
    },
  },
  variants: { // all the following default to ['responsive']
    textFillColor: ['responsive'],
    textStrokeColor: ['responsive'],
    textStrokeWidth: ['responsive'],
    paintOrder: ['responsive'],
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-text-fill-stroke')()
  ],
}

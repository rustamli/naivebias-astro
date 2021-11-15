module.exports = {
    darkMode: 'class',
    mode: 'jit',
    purge: ['./public/**/*.html', './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}'],
    plugins: [
        require('@tailwindcss/typography')
    ],
    theme: {
        extend: {
          typography: {
            DEFAULT: {
              css: {
                maxWidth: '65ch',
                color: 'inherit',
                a: {
                  color: 'inherit',
                  opacity: 1,
                  fontWeight: '500',
                  textDecoration: 'underline',
                  '&:hover': {
                    opacity: 1,
                    color: '#dc2626',
                  },
                },
                b: { color: 'inherit' },
                strong: { color: 'inherit' },
                em: { color: 'inherit' },
                h1: { color: 'inherit' },
                h2: { color: 'inherit' },
                h3: { color: 'inherit' },
                h4: { color: 'inherit' },
                code: { color: 'inherit' },
              },
            },
          }
        },
    }
};
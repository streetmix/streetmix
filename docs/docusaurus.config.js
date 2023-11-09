const lightCodeTheme = require('prism-react-renderer').themes.github
const darkCodeTheme = require('prism-react-renderer').themes.dracula
const remarkSmartypants = require('@silvenon/remark-smartypants')

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Streetmix Documentation',
  tagline: 'A guidebook for the makers and the users of Streetmix.',
  url: 'https://docs.streetmix.net',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'streetmix', // Usually your GitHub org/user name.
  projectName: 'streetmix', // Usually your repo name.
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap'
  ],
  themeConfig: {
    image: 'thumbnail.png',
    navbar: {
      title: 'Streetmix Docs',
      logo: {
        alt: 'Streetmix Documentation Logo',
        src: 'img/bookshelf-small.svg'
      },
      items: [
        {
          type: 'doc',
          docId: 'contributing/intro',
          label: 'Contributor docs',
          position: 'left'
        },
        {
          type: 'doc',
          docId: 'user-guide/intro',
          label: 'User guide',
          position: 'left'
        },
        {
          type: 'doc',
          docId: 'community',
          label: 'Community',
          position: 'left'
        },
        {
          type: 'localeDropdown',
          position: 'right',
          dropdownItemsAfter: [
            {
              href: '/contributing/translations/overview',
              label: 'Help us translate'
            }
          ]
        },
        {
          href: 'https://github.com/streetmix/streetmix',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Contributor docs',
              to: '/contributing/intro'
            },
            {
              label: 'User guide',
              to: '/user-guide/intro'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://strt.mx/discord'
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/streetmix'
            }
          ]
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/streetmix/streetmix/'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Streetmix. Built with Docusaurus.`
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/streetmix/streetmix/edit/main/docs/',
          remarkPlugins: [remarkSmartypants]
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/streetmix/streetmix/edit/main/docs/blog/',
          remarkPlugins: [remarkSmartypants]
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ]
}

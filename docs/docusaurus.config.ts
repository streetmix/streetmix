import type { Config } from '@docusaurus/types'
import type { Options, ThemeConfig } from '@docusaurus/preset-classic'
import { themes } from 'prism-react-renderer/'
import remarkSmartypants from '@silvenon/remark-smartypants'

const config: Config = {
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
      theme: themes.github,
      darkTheme: themes.dracula
    }
  } satisfies ThemeConfig,
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
      } satisfies Options
    ]
  ]
}

export default config

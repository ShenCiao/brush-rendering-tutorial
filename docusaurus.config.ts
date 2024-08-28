// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type {Config} from '@docusaurus/types'
import {themes as prismThemes} from 'prism-react-renderer';

export default {
  title: 'Brush Rendering Tutorial',
  tagline: 'Learn brush stroke rendering.',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://shenciao.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/brush-rendering-tutorial/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ShenCiao', // Usually your GitHub org/user name.
  projectName: 'brush-rendering-tutorial', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/ShenCiao/brush-rendering-tutorial/tree/main',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-CGVJD5P2PP',
          anonymizeIP: true,
        },
      },
    ],
  ],

  themeConfig:{
    prism:{
      theme: prismThemes.github,
      additionalLanguages: ['c', 'cpp', 'glsl'],
    },
    colorMode: {disableSwitch: true},
    // Replace with your project's social card
    image: 'img/vanilla-stroke.png',
    navbar: {
      title: 'Brush Rendering Tutorial',
      logo: {
        alt: 'logo',
        src: 'img/vanilla-stroke.png'
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'right',
          label: 'Tutorial',
        },
        {
          href: 'https://github.com/ShenCiao/brush-stroke-tutorial',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `Copyright © ${new Date().getFullYear()} Brush Rendering Tutorial, under CC BY-SA 4.0 License`,
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    stylesheets: [
      {
        href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
        type: 'text/css',
        integrity:
          'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
        crossorigin: 'anonymous',
      },
    ],
  },
  plugins: [
    'raw-loaders',
  ],
  trailingSlash : true
} satisfies Config;

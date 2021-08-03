import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Head from '@docusaurus/Head'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import HomepageFeatures from '../components/HomepageFeatures'
import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  const Svg = require('../../static/img/bookshelf.svg').default

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <Svg
          className={clsx('margin-vert--lg', styles.heroImage)}
          alt="bookshelf"
        />

        <HomepageFeatures />
      </div>
    </header>
  )
}

export default function Home() {
  return (
    <Layout description="Documentation for the makers and the users of Streetmix.">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin={true}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <HomepageHeader />
    </Layout>
  )
}

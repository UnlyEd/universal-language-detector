import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import Footer from '../components/footer';
import I18nCard from '../components/i18nCard';

import Nav from '../components/nav';

const Page2 = (props) => {
  const { lang, isSSR } = props;

  return (
    <div>
      <Head>
        <title>Page 2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Nav />

      <div className="hero">
        <h1 className="title">Welcome to our "with-next" example, featuring Next.js!</h1>
        <h2>Using {isSSR ? 'server-side' : 'client-side'} detection</h2>
        <hr />

        <I18nCard
          lang={lang}
        />

        <br />
        <hr />
        <br />
        <Link href={'/'}>
          Go to home
        </Link>
      </div>

      <Footer />

      <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
        text-align: center;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .title, h2 {
        text-align: center;
      }
      .row {
        max-width: 880px;
        margin: 80px auto 40px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
      .card {
        padding: 18px 18px 24px;
        width: 220px;
        text-align: left;
        text-decoration: none;
        color: #434343;
        border: 1px solid #9b9b9b;
      }
      .card:hover {
        border-color: #067df7;
      }
      .card h3 {
        margin: 0;
        color: #067df7;
        font-size: 18px;
      }
      .card p {
        margin: 0;
        padding: 12px 0 0;
        font-size: 13px;
        color: #333;
      }
    `}</style>
    </div>
  );
};

export default Page2;

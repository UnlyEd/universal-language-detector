import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import Footer from '../components/footer';

import Nav from '../components/nav';
import I18nCard from '../components/i18nCard';

const Home = (props) => {
  const { bestCountryCodes, lang } = props;

  return (
    <div>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Nav />

      <div className="hero">
        <h1 className="title">Welcome to our "with-next" example, featuring Next.js!</h1>
        <hr />

        <I18nCard
          bestCountryCodes={bestCountryCodes}
          lang={lang}
        />

        <br />
        <hr />
        <br />
        <Link href={'/page2'}>
          Go to page 2
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

export default Home;

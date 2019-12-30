import Head from 'next/head';
import React from 'react';

import Nav from '../components/nav';
import { ACCEPTED_LANGUAGES, FALLBACK_LANG } from '../utils/i18n';

const Home = (props) => {
  const { bestCountryCodes, lang} = props;

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
        <div className="description">
          <strong>Detected language</strong>: <pre>{lang}</pre>
          Detected best languages: <pre>{bestCountryCodes.join(', ')}</pre>
          Using fallback language (if lang cannot be resolved): <pre>{FALLBACK_LANG}</pre>
          Using allowed languages: <pre>{ACCEPTED_LANGUAGES.join(', ')}</pre>
        </div>
      </div>

      <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .title,
      .description {
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

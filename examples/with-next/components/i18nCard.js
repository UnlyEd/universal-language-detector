import { COOKIE_LOOKUP_KEY_LANG } from '@unly/universal-language-detector';
import Cookies from 'js-cookie';
import React from 'react';

import { ACCEPTED_LANGUAGES, FALLBACK_LANG } from '../utils/i18n';

const i18nCard = (props) => {
  const { bestCountryCodes, lang } = props;

  return (
    <>
      <div className="description">
        <strong>Detected language</strong>: <pre>{lang}</pre>
        Detected best languages: <pre>{bestCountryCodes.join(', ')}</pre>
        Using fallback language (if lang cannot be resolved): <pre>{FALLBACK_LANG}</pre>
        Using allowed languages: <pre>{ACCEPTED_LANGUAGES.join(', ')}</pre>
      </div>

      <div className="description">
        Change the language <i>(set a cookie that will take precedence over the browser language preferences)</i>:
        <div>
          <button
            onClick={() => {
              Cookies.set(COOKIE_LOOKUP_KEY_LANG, 'fr');
              location.reload();
            }}
          >
            Français
          </button>
          <button
            onClick={() => {
              Cookies.set(COOKIE_LOOKUP_KEY_LANG, 'en');
              location.reload();
            }}
          >
            English
          </button>
          <button
            onClick={() => {
              Cookies.set(COOKIE_LOOKUP_KEY_LANG, 'es');
              location.reload();
            }}
          >
            Spanish
          </button>
        </div>
      </div>

      <style jsx>{`
        .description {
          text-align: center;
        }
        
        button {
          background-color: blue;
          color: white;
          border-radius: 10px;
          padding: 10px;
          cursor: pointer;
        }
    `}</style>
    </>
  );
};

export default i18nCard;

import React from 'react';

const footer = (props) => {
  return (
    <>
      <div className={'footer'}>
        <a href={'https://github.com/UnlyEd/universal-language-detector'}>GitHub</a>
      </div>

      <style jsx>{`
        .footer {
          margin-top: 100px;
          text-align: center;
        }
    `}</style>
    </>
  );
};

export default footer;

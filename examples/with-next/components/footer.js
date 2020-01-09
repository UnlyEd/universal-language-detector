import React from 'react';
import packageJson from '../package'

const footer = (props) => {
  const uldVersion = packageJson.dependencies['@unly/universal-language-detector'];

  return (
    <>
      <div className={'footer'}>
        <a href={'https://github.com/UnlyEd/universal-language-detector'}>GitHub</a>

        <div
          style={{
            fontStyle: 'italic',
            marginTop: 20
          }}
        >
          Demo using <code>`@unly/universal-language-detector`: '{uldVersion}'</code>
        </div>
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

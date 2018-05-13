const TextToSVG = require('text-to-svg');
const opentype = require('opentype.js');
const request = require('request-promise');
const axios = require('axios');

function generateVerticalLogo(svgText, svgTextMetrics, iconSvgBody, iconViewbox, sizer) {
  const textSizer = 3 * sizer;
  const iconSizer = (150 / iconViewbox.width) * sizer;
  const textTop = (150 * sizer) + 20;

  const svgOptions = {
    imageWidth: 500 * sizer,
    imageHeight: 500 * sizer,

    iconWidth: 150 * sizer,
    icontHeight: 150 * sizer,

    textWidth: svgTextMetrics.width * textSizer,

    // iconWidth >= textWidth ? iconWidth : textWidth
    contentWidth: (150 * sizer) >= svgTextMetrics.width * textSizer ? (150 * sizer) : svgTextMetrics.width * textSizer,
    contentHeight: (svgTextMetrics.height * textSizer) + textTop,
  };

  const mySvg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.0" x="0px" y="0px" width="${svgOptions.imageWidth}px" height="${svgOptions.imageHeight}px">

      <rect fill="#eee" opacity="0" height="100%" width="100%" />

      <svg width="${svgOptions.contentWidth}px" x="${(svgOptions.imageWidth - svgOptions.contentWidth) / 2}px"
      height="${svgOptions.contentHeight}px" y="${(svgOptions.imageHeight - svgOptions.contentHeight) / 2}px">
      
        <rect fill="#aaa" opacity="0" height="100%" width="100%" />
        
        <svg width="${svgOptions.iconWidth}px" height="${svgOptions.iconHeight}"
          x="${(svgOptions.contentWidth - svgOptions.iconWidth) / 2}px">
            <g fill="#000"  transform="scale(${iconSizer})">
              ${iconSvgBody}
            </g>
        </svg>

        <svg width="${svgOptions.textWidth}px" x="${(svgOptions.contentWidth - svgOptions.textWidth) / 2}px">
          <g transform="translate(0 ${textTop}) scale(${textSizer})">
            <path fill="#000" d="${svgText}"/>
          </g>
        </svg>
        
      </svg> 
    </svg>
  `;

  return mySvg;
}

function generateSvg(logoType, fontData, iconSvgRaw, text, sizer) {
  const reIconSvgBody = /<svg [^>]+>([^]+)<\/svg>/gm;
  const iconSvgBody = reIconSvgBody.exec(iconSvgRaw)[1];

  const reIconViewbox = /viewBox="([^"]+)"/gm;
  const iconViewboxRaw = reIconViewbox.exec(iconSvgRaw)[1];
  const iconViewbox = {
    width: parseFloat(iconViewboxRaw.split(' ')[2]),
    height: parseFloat(iconViewboxRaw.split(' ')[3]),
  };

  let fontSize = 30;
  const attributes = { fill: 'red' };
  const options = { x: 0, y: 0, fontSize, anchor: 'top', attributes };

  // https://www.npmjs.com/package/text-to-svg
  // https://stackoverflow.com/a/31394257
  // res is Buffer https://github.com/request/request-promise/issues/171
  // eslint-disable-next-line max-len
  const arrayBufferFont = fontData.buffer.slice(fontData.byteOffset, fontData.byteOffset + fontData.byteLength);
  const textToSVG = new TextToSVG(opentype.parse(arrayBufferFont));
  const svgText = textToSVG.getD(text, options);
  const svgTextMetrics = textToSVG.getMetrics(text, options);

  // TODO: Add support for several logotypes (icon/vertical/horizontal)
  let mySvg;
  if (logoType === 'all') {
    mySvg = {
      vertical: generateVerticalLogo(svgText, svgTextMetrics, iconSvgBody, iconViewbox, 0.6),
    };
  }
  return mySvg;
}

// http://2ality.com/2011/11/keyword-parameters.html
// https://medium.com/dailyjs/named-and-optional-arguments-in-javascript-using-es6-destructuring-292a683d5b4e
function generateSvgBase(logoType, iconUrl, fontUrl, text, { sizer = 1 } = {}) {
  const requestOptions = {
    url: fontUrl,
    encoding: null,
  };

  // return Promise.all([
  //   request.get(requestOptions),
  //   request.get(iconUrl),
  // ]).then(([fontData, iconSvg]) => {

  /* eslint-disable arrow-body-style */
  return request.get(requestOptions)
    .then((fontData) => {
      return axios.post('/micro-api/proxy', { url: iconUrl })
        .then((iconSvgResponse) => {
          return generateSvg(logoType, fontData, iconSvgResponse.data, text, sizer);
        });
    });
  /* eslint-enable arrow-body-style */
}

// https://github.com/webpack/webpack/issues/4039
export default generateSvgBase;

const TextToSVG = require('text-to-svg');
const opentype = require('opentype.js');
const request = require('request-promise');
const axios = require('axios');

// https://www.npmjs.com/package/text-to-svg
function generateText(fontData, text) {
  const fontSize = text.length > 5 ? 30 - text.length : 30;
  const attributes = { fill: 'red' };
  const options = { x: 0, y: 0, fontSize, anchor: 'top', attributes };

  // https://stackoverflow.com/a/31394257
  // res is Buffer https://github.com/request/request-promise/issues/171
  // eslint-disable-next-line max-len
  const arrayBufferFont = fontData.buffer.slice(fontData.byteOffset, fontData.byteOffset + fontData.byteLength);
  const textToSVG = new TextToSVG(opentype.parse(arrayBufferFont));
  const svgText = textToSVG.getD(text, options);
  const svgTextMetrics = textToSVG.getMetrics(text, options);
  return { svgText, svgTextMetrics };
}

function generateVerticalLogo(fontData, text, iconSvgBody, iconViewbox, sizer) {
  const { svgText, svgTextMetrics } = generateText(fontData, text);

  const textSizer = 3 * sizer;
  const iconSizer = (150 / iconViewbox.width) * sizer;
  const textTop = (150 * sizer) + 20;

  const svgOptions = {
    imageWidth: 500 * sizer,
    imageHeight: 500 * sizer,

    iconWidth: 150 * sizer,
    iconHeight: 150 * sizer,

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

function generateHorizontalLogo(fontData, text, iconSvgBody, iconViewbox, sizer) {
  const { svgText, svgTextMetrics } = generateText(fontData, text);

  const textSizer = 2 * sizer;
  const iconSizer = (150 / iconViewbox.width) * sizer;
  const textLeft = (150 * sizer) + 20;

  const svgOptions = {
    imageWidth: 500 * sizer,
    imageHeight: 500 * sizer,

    iconWidth: 150 * sizer,
    iconHeight: 150 * sizer,

    textWidth: svgTextMetrics.width * textSizer,
    textHeight: svgTextMetrics.height * textSizer,

    contentWidth: (svgTextMetrics.width * textSizer) + textLeft,
    contentHeight: 150 * sizer,
  };

  const mySvg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.0" x="0px" y="0px" width="${svgOptions.imageWidth}px" height="${svgOptions.imageHeight}px"
      preserveAspectRatio="xMinYMin meet">

      <rect fill="#eee" opacity="0" height="100%" width="100%" />

      <svg width="${svgOptions.contentWidth}px" x="${(svgOptions.imageWidth - svgOptions.contentWidth) / 2}px"
      height="${svgOptions.contentHeight}px" y="${(svgOptions.imageHeight - svgOptions.contentHeight) / 2}px">
      
        <rect fill="#aaa" opacity="0" height="100%" width="100%" />
        
        <svg height="${svgOptions.iconHeight}" y="${(svgOptions.contentHeight - svgOptions.iconHeight) / 2}px"
          width="${svgOptions.iconWidth}px" >
            <g fill="#000"  transform="scale(${iconSizer})">
              ${iconSvgBody}
            </g>
        </svg>

        <svg height="${svgOptions.textHeight}" y="${(svgOptions.contentHeight - svgOptions.textHeight) / 2}px"
          width="${svgOptions.textWidth}" x="${textLeft}">
            <g transform="scale(${textSizer})">
              <path fill="#000" d="${svgText}"/>
            </g>
        </svg>

      </svg>
    </svg>
  `;

  return mySvg;
}

function generateLogoIcon(logoType, iconSvgBody, iconViewbox, sizer) {
  const iconSizer = (300 / iconViewbox.width) * sizer;

  const svgOptions = {
    imageWidth: 500 * sizer,
    imageHeight: 500 * sizer,

    iconWidth: 300 * sizer,
    iconHeight: 300 * sizer,
  };

  const backgrounds = {
    logoIconSquareSvg: '<rect fill="#fff" height="100%" width="100%" />',
    logoIconRoundedSquareSvg: '<rect fill="#fff" height="100%" width="100%" rx="15" ry="15" />',
    logoIconCircleSvg: '<rect fill="#fff" height="100%" width="100%" rx="50%" ry="50%" />',
  };

  const currentBackground = backgrounds[logoType];

  const mySvg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.0" x="0px" y="0px" width="${svgOptions.imageWidth}px" height="${svgOptions.imageHeight}px">

        ${currentBackground}

        <svg height="${svgOptions.iconHeight}" y="${(svgOptions.imageHeight - svgOptions.iconHeight) / 2}px"
          width="${svgOptions.iconWidth}px" x="${(svgOptions.imageWidth - svgOptions.iconWidth) / 2}px">
            <g fill="#000"  transform="scale(${iconSizer})">
              ${iconSvgBody}
            </g>
        </svg>
    </svg>
  `;

  return mySvg;
}

function getIconViewbox(iconSvgRaw) {
  const reIconSvgBody = /<svg [^>]+>([^]+)<\/svg>/gm;
  const iconSvgBody = reIconSvgBody.exec(iconSvgRaw)[1];

  const reIconViewbox = /viewBox="([^"]+)"/gm;
  const iconViewboxRaw = reIconViewbox.exec(iconSvgRaw)[1];
  const iconViewbox = {
    width: parseFloat(iconViewboxRaw.split(' ')[2]),
    height: parseFloat(iconViewboxRaw.split(' ')[3]),
  };

  return { iconSvgBody, iconViewbox };
}

function generateSvg(fontData, iconSvgRaw, text, sizer) {
  const { iconSvgBody, iconViewbox } = getIconViewbox(iconSvgRaw);

  const mySvg = {
    verticalLogoSvg: generateVerticalLogo(fontData, text, iconSvgBody, iconViewbox, 0.6 * sizer),
    horizontalLogoSvg: generateHorizontalLogo(fontData, text, iconSvgBody, iconViewbox, 0.6 * sizer),

    logoIconSquareSvg: generateLogoIcon('logoIconSquareSvg', iconSvgBody, iconViewbox, 0.2 * sizer),
    logoIconRoundedSquareSvg: generateLogoIcon('logoIconRoundedSquareSvg', iconSvgBody, iconViewbox, 0.2 * sizer),
    logoIconCircleSvg: generateLogoIcon('logoIconCircleSvg', iconSvgBody, iconViewbox, 0.2 * sizer),
  };
  return mySvg;
}

// http://2ality.com/2011/11/keyword-parameters.html
// https://medium.com/dailyjs/named-and-optional-arguments-in-javascript-using-es6-destructuring-292a683d5b4e
function generateSvgBase(logoType, iconUrl, fontUrl, text, { sizer = 1 } = {}) {
  const requestOptions = {
    url: fontUrl,
    encoding: null,
  };

  const iconRequestOptions = {
    method: 'post',
    url: '/micro-api/proxy',
    data: { url: iconUrl },
  };

  return Promise.all([
    request.get(requestOptions),
    axios(iconRequestOptions),
  ]).then(([fontData, iconSvgResponse]) => {
    const mySvg = generateSvg(fontData, iconSvgResponse.data, text, sizer);

    if (logoType === 'all') {
      return mySvg;
    }
    return mySvg[logoType];
  });

  /* eslint-disable arrow-body-style */
  // return request.get(requestOptions)
  //   .then((fontData) => {
  //     return axios.post('/micro-api/proxy', { url: iconUrl })
  //             .then((iconSvgResponse) => {
  //               return generateSvg(logoType, fontData, iconSvgResponse.data, text, sizer);
  //             });
  //   });
  /* eslint-enable arrow-body-style */
}

// https://github.com/webpack/webpack/issues/4039
export default generateSvgBase;

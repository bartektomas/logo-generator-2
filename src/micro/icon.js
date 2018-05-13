const { send } = require('micro');
const request = require('request-promise');

const thenounproject_key = process.env.THENOUNPROJECT_KEY;
const thenounproject_secret = process.env.THENOUNPROJECT_SECRET;


module.exports = async (req, res) => {

  const iconTerm = req.params.iconTerm;

	// Yoba (App)
  const oauth = {
    consumer_key: thenounproject_key,
    consumer_secret: thenounproject_secret
	};

	const requestOptions = {
	  url: `https://api.thenounproject.com/icons/${iconTerm}?limit_to_public_domain=1&limit=50`,
	  oauth,
	  json: true,
	  // resolveWithFullResponse: true
	};

	return request.get(requestOptions)
	  .then((data) => {
	  	return send(res, 200, data);
	  })
	  .catch((error) => {
	  	console.log('ERROR');
	  	console.log(error);
		  return send(res, 404, {error: '404'});
    });
}

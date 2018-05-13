const { send, json } = require('micro');
const { router, get, post } = require('microrouter');
// const axios = require('axios');
const request = require('request-promise');

const getIcon =  require('./icon.js');

const notfound = (req, res) => send(res, 404, 'Not found route');

const proxy = async (req, res) => {
	const body = await json(req);
	return request.get(body.url)
    .then((response) => {
      return response;
    });
};

module.exports = router(
	get('/icons/:iconTerm', getIcon),
	post('/proxy(/)', proxy),

	get('/*', notfound)
)
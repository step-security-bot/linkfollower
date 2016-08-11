const http = require('http');
const https = require('https');
const url = require('url');

const MAX_REDIRECT_DEPTH = 10;

let follow = (link) => {
    return new Promise((resolve, reject) => {
        let parsedUrl = url.parse(link);
        if (parsedUrl.protocol == null || parsedUrl.host == null) {
            reject(link + ' is not a valid URL');
        }

        startFollowing(parsedUrl, result => {
            resolve(result);
        }, error => {
            reject(error.message);
        });
    })
};

let startFollowing = (startUrl, success, failure) => {
    let depth = 0;
    let result = [];

    let visit = location => {
        if (depth >= MAX_REDIRECT_DEPTH) {
            failure(new Error('Exceeded max redirect depth of ' + MAX_REDIRECT_DEPTH));
        }

        let options = {
            host: location.hostname,
            path: location.path,
            port: location.port
        };
        let requestor = location.protocol.startsWith('https') ? https : http;
        requestor.get(options, response => {
            response.on('data', d => {/* don't care */});

            response.on('end', () => {
                result.push({ url: location.href, status: response.statusCode });
                if (isRedirect(response)) {
                    depth++;
                    visit(location.parse(response.headers.location));
                } else {
                    success(result);
                }
            });
        }).on('error', function (err) {
            failure(err);
        });
    }

    visit(startUrl);
};

let isRedirect = response => {
    let statusCode = response.statusCode;
    return statusCode === 301
        || statusCode === 302
        || statusCode === 303
        || statusCode === 307
        || statusCode === 308;
}

exports.follow = follow;
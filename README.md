# LMIS-Chrome

[![Build Status][travis-image]][travis-url] [![devDependency Status][daviddm-image]][daviddm-url] [![Coverage Status][coveralls-image]][coveralls-url]

[travis-url]: https://travis-ci.org/eHealthAfrica/LMIS-Chrome
[travis-image]: https://travis-ci.org/eHealthAfrica/LMIS-Chrome.png?branch=master
[daviddm-url]: https://david-dm.org/eHealthAfrica/LMIS-Chrome#info=devDependencies
[daviddm-image]: https://david-dm.org/eHealthAfrica/LMIS-Chrome/dev-status.png?theme=shields.io
[coveralls-url]: https://coveralls.io/r/eHealthAfrica/LMIS-Chrome
[coveralls-image]: https://coveralls.io/repos/eHealthAfrica/LMIS-Chrome/badge.png

> LMIS Chrome packaged app

## Usage

0. Install [Chrome][] [Node.js][] and [Git][]
1. `npm install -g karma grunt-cli bower`
2. `git clone https://github.com/eHealthAfrica/LMIS-Chrome.git`
3. `cd LMIS-Chrome && npm install; bower install`
4. `grunt serve`
5. Launch Chrome and browse to [chrome://extensions][]
6. Check "Developer Mode"
7. Click "Load unpacked extension…" and select `/path/to/LMIS-Chrome/app`
8. Under the "LMIS Chrome" extension, click "Launch"

[Chrome]: https://www.google.com/intl/en/chrome/
[Node.js]: http://nodejs.org
[Git]: http://git-scm.com
[chrome://extensions]: chrome://extensions

## Testing

Use `grunt test` for the complete test suite. `npm test` is reserved for our
continuous integration server (TravisCI).

### Unit

Use `grunt test:unit`. During development, `npm run-script test-watch` is
useful to automatically re-run the tests when a file changes.

### e2e

1. Install selenium (one-time only):

    ```bash
    ./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update
    ```

2. `grunt test:e2e`

## Author

© 2014 [eHealth Systems Africa](http://ehealthafrica.org)

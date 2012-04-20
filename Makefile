
test:
	@npm install
	@node ./build/makeconf.js
	@./node_modules/mocha/bin/mocha --reporter spec --timeout 5000 test/unit/*.js

func:
	@node ./build/makeconf.js
	@/usr/local/bin/node dispatch.js &> /dev/null &
	@-./node_modules/mocha/bin/mocha --reporter spec --timeout 10000 test/func/*.js
	@ps ux | grep node | grep -v grep | awk '{print $$2}' | xargs kill -9 

cov:
	@/bin/bash build/script/jscoverage.sh
	-mv lib lib.bak && ./bin/jscoverage lib.bak lib && mv app app.bak && ./bin/jscoverage app.bak app
	-./node_modules/mocha/bin/mocha --reporter html-cov --timeout 5000 test/unit/*.js > ./build/coverage.html
	-rm -rf lib && mv lib.bak lib
	-rm -rf app && mv app.bak app

clean:
	-rm -rf build/coverage.html
	-rm -rf logs/*
	-find conf -type f | grep -v svn | xargs rm -f
	-find test/unit/conf -type f | grep -v svn | xargs rm -f

.PHONY: test

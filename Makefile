
all: scripts

test: scripts 
	@./node_modules/.bin/mocha \
	    --require should \
	    --reporter spec \
	    --bail

scripts: lib/index.js lib/parsers.js

lib/%.js: src/%.coffee
	./node_modules/coffee-script/bin/coffee -o lib -c $^

.PHONY: test scripts

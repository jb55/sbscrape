
all: scripts

test: scripts 
	@./node_modules/.bin/mocha \
	    --require should \
	    --reporter spec \
	    --bail

scripts: lib/index.js lib/parsers.js

lib/%.js: src/%.coffee
	coffee -o lib -c $^

.PHONY: test scripts

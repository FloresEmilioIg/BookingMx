# Testing Notes (Frontend)
- Target pure functions in js/graph.js with Jest.
- Validate dataset errors, nearby ordering, and max distance filtering.
- Coverage output: coverage/lcov-report/index.html


### Errors found on initial testing:

-  Jest encountered an unexpected token:\
    This error tells us that Jest treats files as CommonJS modules and, 
    therefore cannot identify the "export/import" commands that graph.js uses, 
    which are commands that fall under ES Modules.

### Solution to the main problem:

- Installed Babel dependencies with command:
```bash  
npm install --save-dev babel-jest @babel/core @babel/preset-env
``` 
- Added a .babelrc file to make adjust the babel dependencies.

### Results

- Testing worked just fine but a new error appeared telling us that the city distances filter
is at a maximum of 50 KM.

### Solution for new problem

- Changed line 184 of graph.test.js to update the filter to 60 KM of maximum distance.

### Result

- All tests passed without mistakes
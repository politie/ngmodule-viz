# NgModules visualization

Commandline tool to visualize the dependencies between the @NgModules in your Angular 2+ application.

## Usage
* Install the tool: `npm install ngmodule-viz -g`.

### Generate dependency information
* Run `ngmodule-viz <input> <output>`, where:
  * `<input>` points to your Angular 2+ app (e.g. /Users/johndoe/ui-dashboard) 
  * `<output>` to the dir where the visualization should be placed (e.g. your current working dir)
* The tool outputs a _ngmodules.json_ file with all the dependencies between your NgModules. It also outputs an _index.html_ for visualising these dependencies. 

### Visualize dependency information
* Start a http-server (`npm install -g http-server` followed by `http-server`) in your `<output>` dir.
* Open http://localhost:8080/
* Enjoy the graph of your NgModules!

## Building
* Clone this project
* Install typescript: `npm install -g typescript`
* Run `npm run build` to compile the typescript to javascript. Or `npm run build:watch` to keep the typescript compiler running during development.
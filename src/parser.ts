import globby = require('globby');
import fs = require('fs');
import path = require('path');

export class Parser {
    private readonly NG_MODULE_FILEPATTERN = '*.module.ts';
    private readonly RESULT_FILE = 'ngmodules.json';
    private readonly HTML_FILE = 'index.html';

    parseNgModulesAndWriteToJson(inputPath: string, outputPath: string) {
        console.log('parsing ngmodules in:', inputPath);
        globby([inputPath + '/**/' + this.NG_MODULE_FILEPATTERN]).then(files => {
            if (files.length === 0) {
                return console.error('no ngmodule files found');
            }

            let modulesWithImports = this.parseNgModuleFiles(files);
            this.writeResults(outputPath, this.createJsonResult(modulesWithImports));
        });
    }

    private parseNgModuleFiles(files: string[]): Map<string, string[]> {
        let modulesWithImports = new Map<string, string[]>();
        files.forEach((file) => {
            console.log('parsing ngmodule:', file)
            let content = fs.readFileSync(file, 'utf8');
            let classname = this.extractModuleName(file, content);
            let imports = this.extractModuleImports(file, content);
            if (classname) {
                modulesWithImports.set(classname, imports);
            }
        });
        return modulesWithImports;
    }

    private createJsonResult(modulesWithImports: Map<string, string[]>): any[] {
        let result: any[] = []; // json output for d3js
        modulesWithImports.forEach((imports, classname) => {
            imports.forEach((moduleImport) => {
                let externalModule = !modulesWithImports.has(moduleImport);
                if (moduleImport) {
                    let d3json = { 'source': classname, 'target': moduleImport, 'externalmodule': externalModule};
                    result.push(d3json);
                }
            });
        });
        return result;
    }

    private extractModuleName(filename: string, fileContent: string): string {
        const CLASS_NAME_REGEX = new RegExp(/class (.*) {/g); // match 'class FooBarModule {'

        let classNameMatch = fileContent.match(CLASS_NAME_REGEX);
        if (!classNameMatch) {
            console.error('no class name of module found in file ' + filename + ' (skipping)');
            return;
        }
        return classNameMatch[0].substr(6, classNameMatch[0].length - 8).trim(); // strip 'class ' and trailing '{'
    }

    private extractModuleImports(filename: string, fileContent: string): string[] {
        const MODULE_REGEX = new RegExp(/@NgModule\(\{(.|\s)*\}\)/gm); // match @NgModule()

        let moduleMatch = fileContent.match(MODULE_REGEX);
        if (!moduleMatch) {
            console.error('no @NgModule found in file ' + filename + ' (skipping)');
            return;
        }

        const PREFIX_REGEX = new RegExp(/(.|\n)+?(?=\[)\[/); // strip everything at the start of the module (e.g. 'imports' keyword)
        const SUFFIX_REGEX = new RegExp(/\](.|\n)*/gm); // strip everything after the imports (e.g. exports, declarations, etc)
        const WHITESPACE_REGEX = new RegExp(/\s/g); // strip any remaining whitespace
        const SINGLE_QUOTE_REGEX = new RegExp(',', 'g')
        const ARRAY_START = '[ \"';
        const ARRAY_SEPARATOR = '\",\"';
        const ARRYS_END = '\" ]';

        let moduleStr = moduleMatch[0].substr(10, moduleMatch[0].length -1); // strip '@NgModule('
        let importStr = moduleStr.replace(PREFIX_REGEX,'').replace(SUFFIX_REGEX,'').replace(WHITESPACE_REGEX,'').replace(SINGLE_QUOTE_REGEX, ARRAY_SEPARATOR);
        return JSON.parse(ARRAY_START + importStr + ARRYS_END);
    }

    private writeResults(outputPath: string, result: string[]) {
        try {
            fs.writeFileSync(path.join(outputPath, this.RESULT_FILE), JSON.stringify(result));
            fs.writeFileSync(path.join(outputPath, this.HTML_FILE), fs.readFileSync(path.join(__dirname, this.HTML_FILE)));
            console.log('output written to:', outputPath);
        } catch (e) {
            console.error('error writing results', e);
        }
    }
}
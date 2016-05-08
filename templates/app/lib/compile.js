var fs = require('fs');
var codegen = require('./codegen.js');
var Solidity = require('blockapps-js').Solidity;
var path = require('path');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var Promise = require('bluebird');

module.exports = compileSol;
function compileSol(solSrc) {
  return Solidity(solSrc).then(function(solObj) {
    var multi = false;
    var dirs = [];
      
    if (typeof solObj.name === 'undefined' || solObj.name === '') {
        dirs = Object.keys(solObj.src).map(function (contract) { 
            return path.join('app','meta', contract);
        });
	multi = true;
    } else {
        dirs.push(path.join('app','meta', solObj.name));
    }
	
    console.log(chalk.yellow("Compile successful: "));

    var theObj = {};

    /* unify object schemas */

    if (multi) { 
        theObj = solObj;
    } else {
        var name = solObj.name;
        var innerObj = {};

        innerObj[name] = solObj;
        theObj['src'] = innerObj;
    }

    return Promise.map(dirs, function (contractPath) { 
        mkdirp(contractPath, function () { 
            Object.keys(theObj.src).map(function (contractName) {
                var multiPath = path.join(contractPath, contractName + '.json');


		var src = theObj.src;
                fs.writeFile(multiPath, src[contractName].detach(), function () {
                    console.log(chalk.green("wrote: ") + multiPath);
		});
            });
	});  
    });
   
   
  }).
  catch(function(e) {
    console.log("compile failed with error message: " + e);
  });
}
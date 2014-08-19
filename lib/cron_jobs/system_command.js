var childProcess = require('child_process')

module.exports = function(scriptPath) {

  return function() {

    console.log("About to call script " + scriptPath + "...")
    var child = childProcess.exec(scriptPath, function(err, stdout, stderr) {

      console.log("Script returned")
      if (err) {
        console.error('Error executing ' + scriptPath)
        return
      }
      
      console.log("Script stdout = " + stdout)
      console.error("Script stderr = " + stderr)
      
    })
    
  }

} // END function - module.exports

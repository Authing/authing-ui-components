const chalk = require('chalk')

const feLog = () => {
  console.log(
    chalk.hex('#215AE5')(`
   ___        _   _     _              ______ _____ 
  / _ \\      | | | |   (_)             |  ___|  ___|
 / /_\\ \\_   _| |_| |__  _ _ __   __ _  | |_  | |__  
 |  _  | | | | __| '_ \\| | '_ \\ / _ \`| |  _| |  __| 
 | | | | |_| | |_| | | | | | | | (_| | | |   | |___ 
 \\_| |_/\\__,_|\\__|_| |_|_|_| |_|\\__, | \\_|   \\____/ 
                                 __/ |              
                                |___/               
`)
  )
}

feLog()

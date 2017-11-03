class ConfigParser {

  /**
   * Constructor
   * @param fileName
   */
  constructor(fileName) {

    // those are keys which are samples in the Configuration we have to ignore them and take only the ones which are not commented out.
    this.nodoubleCheck = [
      'CONFIGURATION_H.ENABLEDPIDTEMP.DEFAULT_Kp',
      'CONFIGURATION_H.ENABLEDPIDTEMP.DEFAULT_Ki',
      'CONFIGURATION_H.ENABLEDPIDTEMP.DEFAULT_Kd',
      'CONFIGURATION_H.ENABLEDPIDTEMPBED.DEFAULT_bedKp',
      'CONFIGURATION_H.ENABLEDPIDTEMPBED.DEFAULT_bedKi',
      'CONFIGURATION_H.ENABLEDPIDTEMPBED.DEFAULT_bedKd',
      'CONFIGURATION_H.SPI_SPEED'
    ];

    const fs = require("fs");

    console.info('Parsing file: ' + fileName);

    // read the file
    this.fileContent = fs.readFileSync(fileName, 'utf8').toString().split('\n');

    this.parsedCfgInfos = [];

    this._parseFile();
    this._validateParsedData();
  }


  /**
   * Parses the file
   */
  _parseFile() {


    // holds the stack for endif statements
    let blockStack = [];


    // go through the lines
    this.fileContent.forEach((lineStr, idx) => {

      let line = lineStr.trim();


      // reached the end of an if / elif block remove it from the stack
      if (line.startsWith('#endif') || line.startsWith('#elif')) {
        blockStack.pop();
      }

      // start of an if block
      if (line.startsWith('#if') || line.startsWith('#elif')) {
        let blockName = line
          .replace('#ifndef', '')
          .replace('#if', '')
          .replace('#elif', '')
          .replace(/\(/g, '')
          .replace(/\)/g, '')
          .replace(/\s/g, '')
          .trim();

        blockStack.push(blockName);
        return;
      }


      // only the ones with #define are interesting
      if (line.startsWith('#define') || line.startsWith('//#define')) {

        let keyValue = '';
        let commentedOut = false;

        if (line.startsWith('#define')) {
          keyValue = line.replace('#define', '').trim();
        } else {
          keyValue = line.replace('//#define', '').trim();
          commentedOut = true;
        }

        let lineInfos = {
          key: '',
          stackKey: '',
          value: '',
          lineNr: idx,
          origLine: line,
          commentedOut: commentedOut
        };

        let firstSpacePos = keyValue.indexOf(' ');

        if (firstSpacePos === -1) {
          lineInfos.key = keyValue;
        } else {
          lineInfos.key = keyValue.substring(0, firstSpacePos);
          // parse the rest
          let valueInfo = keyValue.substring(firstSpacePos).trim();

          // check if there is comment in the line
          let commentInfo = valueInfo.indexOf('//');
          if (commentInfo !== -1) {
            valueInfo = valueInfo.substring(0, commentInfo).trim();
          }

          lineInfos.value = valueInfo;
        }

        lineInfos.stackKey = blockStack.join('.') + '.' + lineInfos.key;

        // check if its is one of the double entrances which are commented as sample
        if (this.nodoubleCheck.find(el => lineInfos.stackKey === el) && lineInfos.commentedOut === true) {
          return;
        }

        // push the line info into the info object
        this.parsedCfgInfos.push(lineInfos);
      }
    });
  }


  /**
   * Validates the parsed data and checks if there is something wrong with it
   * @private
   */
  _validateParsedData() {
    let doubleVals = this.parsedCfgInfos.filter(el => this.parsedCfgInfos.find(el2 => (el.stackKey === el2.stackKey) && (el.lineNr !== el2.lineNr)));
    if (doubleVals.length > 0) {
      console.error('!!!!!!!!!!!!! Double keys in CFG found cant use it ! Stoping !!!!!!!!!!!!!');
      console.log(doubleVals.map(el => el.lineNr + ': ' + el.stackKey + ' = ' + el.value));
      process.exit(1);
    }

    console.log('Config file was parsed successfully');
  }
}

exports.ConfigParser = ConfigParser;

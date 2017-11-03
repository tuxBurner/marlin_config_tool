class ConfigDiffer {

  /**
   * finds all cfgs which are not in the other cfg
   * @param cfgWith
   * @param cfgWithout
   * @return {Array.<*>}
   */
  notInCfg(cfgWith, cfgWithout) {
    // find all cfgs which are new
    return cfgWith.parsedCfgInfos.filter(withEl => {
      // when not in the without cfg
      return (!cfgWithout.parsedCfgInfos.find(withoutEl => withEl.stackKey === withoutEl.stackKey))
    });
  }

  /**
   * finds all cfgs with a different value
   * @param oldCfg
   * @param newCfg
   * @return {{}}
   */
  diffrentValue(oldCfg, newCfg) {
    let sameKeys = oldCfg.parsedCfgInfos.filter(oldEl => {

      // get the one with the same key from the newcfg
      return (newCfg.parsedCfgInfos.find(newEl =>
        // same key but diffrent values or commentedOut differs
        (oldEl.stackKey === newEl.stackKey) && ((oldEl.value !== newEl.value) || (oldEl.commentedOut !== newEl.commentedOut))
      ))
    }).map((el) => el.stackKey);

    let returnValue = {};

    // collect old and new values
    sameKeys.forEach(cfgKey => {
      returnValue[cfgKey] = {
        oldValue: oldCfg.parsedCfgInfos.find(el => el.stackKey === cfgKey),
        newValue: newCfg.parsedCfgInfos.find(el => el.stackKey === cfgKey)
      }
    });


    return returnValue;
  }

  /**
   * Dumps the diffs of the values
   * @param valuesDiff
   */
  valuesDiffDumper(valuesDiff) {
    console.log();
    console.log('##############################################################');
    console.log('Differnces found in cfgs <yours> !== <newCfg>');
    console.log('##############################################################');

    Object.keys(valuesDiff).forEach(cfgKey => {
      let diff = valuesDiff[cfgKey];

      if (diff.oldValue.value !== diff.newValue.value) {
        console.log(cfgKey + ' : Value changed: ' + diff.oldValue.value + ' !==  ' + diff.newValue.value);
      }

      if (diff.oldValue.commentedOut === true && diff.newValue.commentedOut === false) {
        console.log(cfgKey + ' : Commented out in yours');
      }

      if (diff.oldValue.commentedOut === false && diff.newValue.commentedOut === true) {
        console.log(cfgKey + ' : Commented out in new');
      }

      if (diff.oldValue.value === diff.newValue.value && diff.oldValue.commentedOut === diff.newValue.commentedOut) {
        console.log(cfgKey + ' ->  ' + diff.oldValue.stackKey + ' -> ' + diff.newValue.stackKey + ' : Weired this should not happen ! ');
        process.exit(1);
      }

      console.log('---');

    });

    console.log('##############################################################');
    console.log();
  }

  /**
   * Dump the diffs found from one config to another
   * @param string
   * @param diffs
   */
  diffDumper(string, diffs) {
    if (diffs.length > 0) {
      console.log();
      console.log('##############################################################');
      console.log(string);
      console.log('##############################################################');

      diffs.forEach(function (el) {
        console.log(el.lineNr + ': ' + el.origLine);
      });

      console.log('##############################################################');
      console.log();
    }
  }

  /**
   * Generate the new marlin cfg from the diff info's
   * @param newCfg
   * @param diffInfos
   * @param filename
   */
  generateMergedCfgFile(newCfg, diffInfos, filename) {
    console.log('Creating new cfg file: ' + filename);

    const fs = require('fs');
    const logger = fs.createWriteStream(filename, {
      flags: 'w' 
    });

    let diffValues = Object.values(diffInfos)

    // write the file
    newCfg.fileContent.forEach((lineConent, lineNr) => {
      // try to check if we have changes and log it

      // check if we have a diff here
      let lineDiff = diffValues.find(diff => diff.newValue.lineNr === lineNr)

      if (lineDiff !== undefined) {
        let newLineContent = '// M_C_T_Orig_Line: ' + lineConent + '\n';
        newLineContent += (lineDiff.oldValue.commentedOut) ? '//' : '';
        newLineContent += '#define ' + lineDiff.oldValue.key + ' ' + lineDiff.oldValue.value + ' // M_C_T_Changes: ';

        if (lineDiff.oldValue.value !== lineDiff.newValue.value) {
          newLineContent += ' Value changed (marlin: ' + lineDiff.newValue.value + ') -> (yours: ' + lineDiff.oldValue.value + ') ';
        }

        if (lineDiff.oldValue.commentedOut !== lineDiff.newValue.commentedOut) {
          newLineContent += 'Commented out changed (marlin: ' + lineDiff.newValue.commentedOut + ') -> (yours: ' + lineDiff.oldValue.commentedOut + ')';
        }

        lineConent = newLineContent;
      }
      logger.write(lineConent + '\n');

    });

  }

}

module.exports = new ConfigDiffer();

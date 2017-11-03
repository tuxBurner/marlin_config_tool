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

      if(diff.oldValue.value !== diff.newValue.value) {
        console.log(cfgKey + ' : Value changed: ' + diff.oldValue.value + ' !==  ' + diff.newValue.value);
      }

      if(diff.oldValue.commentedOut === true && diff.newValue.commentedOut === false) {
        console.log(cfgKey + ' : Commented out in yours');
      }

      if(diff.oldValue.commentedOut === false && diff.newValue.commentedOut === true) {
        console.log(cfgKey + ' : Commented out in new');
      }

      if(diff.oldValue.value === diff.newValue.value && diff.oldValue.commentedOut === diff.newValue.commentedOut) {
        console.log(cfgKey + ' ->  '+diff.oldValue.stackKey + ' -> ' + diff.newValue.stackKey+  ' : Weired this should not happen ! ');
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
    if(diffs.length > 0) {
      console.log();
      console.log('##############################################################');
      console.log(string);
      console.log('##############################################################');

      diffs.forEach(function(el) {
        console.log(el.lineNr + ': ' + el.origLine);
      });

      console.log('##############################################################');
      console.log();
    }
  }

}

module.exports = new ConfigDiffer();

const {ConfigParser} = require('./ConfigParser');
const cfgDiffer = require('./ConfigDiffer');



const ownCfgParser = new ConfigParser('Configuration_seppel.h');

const newCfgParser = new ConfigParser('Configuration_1.1.6.h');


// find all key which are in the new cfg but not in the old one
const newCfgsDiff = cfgDiffer.notInCfg(newCfgParser, ownCfgParser);
cfgDiffer.diffDumper('Following keys are not in the old cfg please check for them after migration', newCfgsDiff);

// find all keys in own cfg which are not in the new one
const oldCfgsDiff = cfgDiffer.notInCfg(ownCfgParser, newCfgParser);
cfgDiffer.diffDumper('Following keys are not in the new cfg', oldCfgsDiff);

// find all with diffrent values
/*let diffrentValues = cfgDiffer.diffrentValue(ownCfgParser,newCfgParser);
cfgDiffer.valuesDiffDumper(diffrentValues);*/

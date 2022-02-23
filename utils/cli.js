const meow = require('meow');
const meowHelp = require('cli-meow-help');

const flags = {
	clear: {
		type: `boolean`,
		default: false,
		desc: `Clear the console`
	},
	noClear: {
		type: `boolean`,
		default: false,
		desc: `Don't clear the console`
	},
	debug: {
		type: `boolean`,
		default: false,
		alias: ``,
		desc: `Print debug info`
	},
	version: {
		type: `boolean`,
		alias: `v`,
		desc: `Print CLI version`
	},
  city: {
    type: 'string',
    alias: 'c',
    desc: 'City to search for',
    default: ''
  },
  setDefault: {
    type: 'boolean',
    alias: 'd',
    desc: 'Set current city as default city'
  },
  system: {
    type: 'string',
    alias: 's',
    desc: 'Unit system to use',
  },
  apiKey: {
    type: 'string',
    desc: 'Set default api key'
  }
};

const commands = {
	help: { desc: `Print help info` }
};

const helpText = meowHelp({
	name: `az`,
	flags,
	commands
});

const options = {
	inferType: true,
	description: false,
	hardRejection: false,
	flags
};

module.exports = meow(helpText, options);

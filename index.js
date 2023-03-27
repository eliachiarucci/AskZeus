#!/usr/bin/env node

/**
 * AskZeus
 * weather report in the cli
 *
 * @author Elia Chiarucci <eliachiarucci.com>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const cliLog = require('./utils/log');
const fetch = require('node-fetch');
const input = cli.input;
const flags = cli.flags;
const chalk = require('chalk');
const chart = require('asciichart');
const { clear, debug, setDefault } = flags;
let city = flags.city;
const log = console.log;
const { defaultCity, system, apiKey } = require('./utils/settings.json');
const config = require('./utils/config');
const box = require('./display/box');

(async () => {
	init({ clear });
	if (input.includes(`help`)) {
		cli.showHelp(0);
		return;
	}
	if (flags.apiKey) {
		if (typeof flags.apiKey !== 'string') {
			return log(
				chalk.red(
					`API key should be as tring, please provide one using the command: az --apiKey <key>`
				)
			);
		}
		config({ property: 'apiKey', value: flags.apiKey });
		return log(chalk.green(`API key set to ${flags.apiKey}`));
	}
	if (apiKey == '')
		return log(
			chalk.yellow(
				'No API Key set. Please set one using the command: az --apiKey <key>'
			)
		);
	if (!city && defaultCity === '') {
		log(
			chalk.yellow(
				'Please declare a city with the -c <city> or --city <city> argument'
			)
		);
		log(
			chalk.yellow(
				'(optional) use the flag -d to also set the city as default'
			)
		);
		return;
	}
	if (!city) city = defaultCity;
	if (city && setDefault) config({ property: 'defaultCity', value: city });
	if (flags.system) {
		if (flags.system !== `metric` && flags.system !== `imperial`)
			return log(
				chalk.red(
					`Invalid system name. Please use metric or imperial, lower case.`
				)
			);
		config({ property: 'system', value: flags.system });
		return log(chalk.green(`Unit system set as ${flags.system}`));
	}
	const cityCoordinatesQuery = await fetch(
		`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`
	);
	const cityCoordinatesRes = await cityCoordinatesQuery.json();
	if (cityCoordinatesRes.cod === 401)
		return log(chalk.red(`Invalid API Key`));
	if (cityCoordinatesRes.cod === 404)
		return log(chalk.red(`City ${city} not found`));
	if (cityCoordinatesRes.length === 0) {
		return log(chalk.red('No location found for given input.'));
	}
	const lat = cityCoordinatesRes[0].lat;
	const lon = cityCoordinatesRes[0].lon;

	const weatherQuery = await fetch(
		`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
	);
	const weatherRes = await weatherQuery.json();
	const { current, minutely, daily } = weatherRes;
	const { temp, feels_like, humidity, pressure, wind_speed } = current;
	const { temp: temp0, weather: weather0 } = daily[0];
	const { temp: temp1, weather: weather1 } = daily[1];
	const { temp: temp2, weather: weather2 } = daily[2];
	const { temp: temp3, weather: weather3 } = daily[3];
	const { description } = current.weather[0];
	const { sunrise, sunset } = current;

	const parseTemp = ({ temp, system }) => {
		if (system === 'metric') {
			return `${Math.round(temp - 273.15)}C°`;
		}
		if (system === 'imperial') {
			return `${Math.round((temp - 273.15) * 1.8 + 32)}F°`;
		}
	};

	const parseSpeed = ({ speed, system }) => {
		if (system === 'metric') {
			return `${Math.round(speed * 3.6)}km/h`;
		}
		if (system === 'imperial') {
			return `${Math.round(speed * 2.236936)}mph`;
		}
	};
	const parseToDoubleDigits = date =>
		date.toString().length != 2 ? `0${date.toString()}` : date.toString();
	const everyTenMinutes =
		minutely && minutely.filter((minute, index) => index % 10 === 0);
	const everyTenMinutesParsed =
		everyTenMinutes &&
		everyTenMinutes.map(minute => ({
			...minute,
			time: `${parseToDoubleDigits(
				new Date(minute.dt * 1000).getHours()
			)}:${parseToDoubleDigits(new Date(minute.dt * 1000).getMinutes())}`
		}));
	log(chalk.bgBlack(chalk.white(`City: ${city} `)));
  log('\n');
  if (weatherRes.alerts && weatherRes.alerts.length > 0) {
    weatherRes.alerts.forEach(alert => {
      log(chalk.yellow(`ALERT`));
			log(chalk.yellow(`-------------------------------------`));
			log(chalk.italic(`From: ${chalk.yellow(alert.sender_name)}`));
			log(chalk.italic(`Event: ${chalk.yellow(alert.event)}`));
			log(
        chalk.italic(`Description: ${chalk.yellow(alert.description)}`)
        );
      });
      log('\n');
	}
	if (minutely) {
		log(chalk.blueBright(`Rain meter (in mm):`));
		log(chalk.blueBright(`--------------------`));
		log(
			chalk.blueBright(
				chart.plot(
					minutely.map(({ precipitation }) => precipitation),
					{ height: 6 }
				)
			)
		);
		log(
			chalk.green(
				`            `,
				everyTenMinutesParsed.map(({ time }) => `${time}`).join('    ')
			)
		);
	} else {
		log(chalk.yellow('No short-term detailed rain data available'));
	}
	log('\n');
	const today = new Date();
	const todayDate = today.getDate();
	const todayMonth = today.getMonth();
	const todayYear = today.getFullYear();
	const todayDateTime = `${todayDate}/${todayMonth}/${todayYear}`;
	log(chalk.green(`Today's forecast and for the next 3 days: `));
	log(chalk.green(`------------------------------------------`));
	log(
		box({
			text: [getDate(0), getDate(1), getDate(2), getDate(3)],
			extraInfo: [
				` ${chalk.redBright(
					`Max: ${parseTemp({
						temp: temp0.max,
						system
					})}`
				)}\n ${chalk.blueBright(
					`Min: ${parseTemp({ temp: temp0.min, system })}`
				)}\n ${chalk.green(`Weather: ${weather0[0].description}`)}`,
				` ${chalk.redBright(
					`Max: ${parseTemp({
						temp: temp1.max,
						system
					})}`
				)}\n ${chalk.blueBright(
					`Min: ${parseTemp({ temp: temp1.min, system })}`
				)}\n ${chalk.green(`Weather: ${weather1[0].description}`)}`,
				` ${chalk.redBright(
					`Max: ${parseTemp({
						temp: temp2.max,
						system
					})}`
				)}\n ${chalk.blueBright(
					`Min: ${parseTemp({ temp: temp2.min, system })}`
				)}\n ${chalk.green(`Weather: ${weather2[0].description}`)}`,
				` ${chalk.redBright(
					`Max: ${parseTemp({
						temp: temp3.max,
						system
					})}`
				)}\n ${chalk.blueBright(
					`Min: ${parseTemp({ temp: temp3.min, system })}`
				)}\n ${chalk.green(`Weather: ${weather3[0].description}`)}`
			]
		})
	);

	log(chalk.white(`Today's weather:`));
  log(chalk.white(`----------------------------`));
	log(chalk.green(`- Current temperature: ${parseTemp({ temp, system })}`));
	log(chalk.green(`- Feels like: ${parseTemp({ temp: feels_like, system })}`));
	log(chalk.cyan(`- Sky: ${description}`));
	log(
		chalk.cyan(
			`- Wind Speed: ${parseSpeed({ speed: wind_speed, system })}`
		)
	);
	log(chalk.white(`----------------------------`));
	log(chalk.white(`\n`));
	debug && cliLog(flags);
})();

function getDate(day) {
	const date = new Date(new Date().setDate(new Date().getDate() + day));
	const todayDate =
		date.getDate().toString().length != 2
			? `0${date.getDate()}`
			: date.getDate();
	const todayMonth =
		date.getMonth().toString().length != 2
			? `0${date.getMonth() + 1}`
			: date.getMonth() + 1;
	const todayYear = date.getFullYear();

	return `${todayDate}/${todayMonth}/${todayYear}`;
}

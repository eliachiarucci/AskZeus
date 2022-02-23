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
const chart = require('asciichart')
const { clear, debug, setDefault } = flags;
let city = flags.city;
const log = console.log;
const { defaultCity, system, apiKey } = require('./settings.json');
const config = require('./utils/config');


(async () => {
	init({ clear });
  if(input.includes(`help`)) {
    cli.showHelp(0);
    return;
  }
  if(flags.apiKey) {
    config({ property: "apiKey", value: flags.apiKey })
    return log(chalk.green(`API key set to ${flags.apiKey}`))
  };
  if(apiKey == "") return log(chalk.yellow("No API Key set. Please set one using the command: az --apiKey <key>"));
  if(!city && defaultCity === "") {
    log(chalk.yellow("Please declare a city with the -c <city> or --city <city> argument"))
    log(chalk.yellow("(optional) use the flag -d to also set the city as default"))
    return;
  };
  if(!city) city = defaultCity;
  if(city && setDefault) config({ property: 'defaultCity', value: city });
  if(flags.system) {
    if(flags.system !== `metric` && flags.system !== `imperial`) return log(chalk.red(`Invalid system name. Please use metric or imperial, lower case.`));
    config({ property: "system", value: flags.system })
    return log(chalk.green(`Unit system set as ${flags.system}`));;
  };
  const cityCoordinatesQuery = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`);
  const cityCoordinatesRes = await cityCoordinatesQuery.json();
  if(cityCoordinatesRes.cod === 401) return log(chalk.red(`Invalid API Key`));
  if(cityCoordinatesRes.cod === 404) return log(chalk.red(`City ${city} not found`));
  if(cityCoordinatesRes.length === 0) {
    return log(chalk.red("No location found for given input."));
  }
  const lat = cityCoordinatesRes[0].lat;
  const lon = cityCoordinatesRes[0].lon;

  const weatherQuery = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`);
  const weatherRes = await weatherQuery.json();
  //console.log(weatherRes);
  const { current, minutely, daily } = weatherRes;
  const { temp, feels_like, humidity, pressure, wind_speed } = current;
  const { temp: minTemp, temp: maxTemp } = daily[0];
  const { description } = current.weather[0];
  const { sunrise, sunset } = current;

  const parseTemp = ({temp, system}) => {
    if(system === "metric") {
      return `${Math.round(temp - 273.15)}C°`;
    }
    if(system === "imperial") {
      return `${Math.round((temp - 273.15) * 1.8 + 32)}F°`;
    }
  }

  const parseSpeed = ({speed, system}) => {
    if(system === "metric") {
      return `${Math.round(speed * 3.6)}km/h`;
    }
    if(system === "imperial") {
      return `${Math.round(speed * 2.236936)}mph`;
    }
  }

  const everyTenMinutes = minutely.filter((minute, index) => index % 10 === 0);
  const everyTenMinutesParsed = everyTenMinutes.map(minute => ({...minute, time: `${new Date(minute.dt * 1000).getHours()}:${new Date(minute.dt * 1000).getMinutes()}`}));
  log(chalk.bgBlack(chalk.white(`City: ${city} `)));
  log(chalk.green(`Current temperature: ${parseTemp({temp, system})}`));
  log(chalk.green(`Feels like: ${parseTemp({temp: feels_like, system})}`));
  log(chalk.cyan(`Conditions: ${description}`));
  log(chalk.cyan(`The wind blows at: ${parseSpeed({speed: wind_speed, system})}`));
  log("\n");
  log(chalk.blueBright(`Rain meter (in mm):`));
  log(chalk.blueBright(chart.plot(minutely.map(({precipitation}) => precipitation), { height: 6 })));
  log(chalk.green(`            `, everyTenMinutesParsed.map(({time}) => `${time}`).join('     ')));
  log("\n");
  if(weatherRes.alerts.length > 0) {
    weatherRes.alerts.forEach(alert => {
      log(chalk.yellow(`ALERT`));
      log(chalk.yellow(`-------------------------------------`));
      log(chalk.italic(`From: ${chalk.yellow(alert.sender_name)}`));
      log(chalk.italic(`Event: ${chalk.yellow(alert.event)}`));
      log(chalk.italic(`Description: ${chalk.yellow(alert.description)}`));
      log("\n");
    })
  }
	debug && cliLog(flags);
})();

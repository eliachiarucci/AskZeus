# AskZeus
AskZeus is a node CLI to get weather info directly inside your terminal.
![CLI Screenshot](https://github.com/eliachiarucci/askzeus/blob/master/img/main.png?raw=true)

## How it works
This projects require you to get a free API key from openWeatherMap(https://openweathermap.org/price), the free key lets you call the API 1,000 times a day.
You can set the key as follows:
```
az --apiKey <key>
```

## Usage
```
az -c Amsterdam
```
Gets you Amsterdam weather data.

```
az -c Amsterdam -d
```
Gets you Amsterdam weather data and set Amsterdam as a default city.

```
az
```
Gets the weather data for the default city.

```
az --system <system>
```
Set the unit system, can be either metric or imperial.
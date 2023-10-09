# Getting Started with Novopangea game bot


## What can it do?
1. Choose the best shift (sorted by profit) for both skilled and unskilled workers in your and other building.
2. Renting other lands and plot buildings from a certain level.
3. Ploting and prolong ploting on your lands.
4. Rest workers in your and other residential buildings.
5. Upgrad workers to a certain level.
6. Don't need to build huge storages as NOVO will be used to store tokens.

## Donations 💵💵💵
This is purely enthusiastic project and open source. You can use it for free.

If you'd like the bot please support me by sending crypto or assets to my wallet: [ete2o.c.wam](https://waxblock.io/account/ete2o.c.wam)

## Install Git 
Download and install Git from the website [https://git-scm.com/](https://git-scm.com/)

## Clone repository

Open terminal and run command:

```
git clone https://github.com/qolota/novopangea_bot.git
```

wait until downloading will be completed


## Install NodeJS

Download and install NodeJS from [https://nodejs.org/en/download](https://nodejs.org/en/download)


## Instlall yarn (package manager)

Run command:

```
npm install --global yarn
```

Find more details on the official website [https://classic.yarnpkg.com/lang/en/docs/install/](https://classic.yarnpkg.com/lang/en/docs/install/)


## Install bot dependencies

Go to the folder and run a command to install dependencies
```
cd ./novopangea_bot
yarn
```

wait until downloading will be completed


## Add your wallet name

Open the file `./src/configs/ACCOUNT_CAPABILITIES.js` and change `<ADD_YOUR_WALLET_NAME_HERE>` to your wallet name e.g. `ete2o.c.wam`


## Change Novopangea bot values

If you'd like to change how the bot works open the file `./src/novopangea/consts/ECONOMY_VALUES.js` and change values.\
Read comments in the file to get more information.


## Start Novopangea bot web-page 

Run command:

```
yarn start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

## Login into your wallet

Open a browser developer console on the bot page `localhost:3000`. You can use `Option + ⌘ + J` (on macOS), or `Shift + CTRL + J` (on Windows/Linux) in Chrome browser.\
Click login button.\
You'll see cloud wallet popup.\
Login as you usually do.\
Check the logs you've been logged in and auto login enabled.
Reload the page and check the logs one more time to verify you're logged in.

## Start Novopangea bot

Click `Start` button.\
Check the logs bot is working.

### Known limitations

1. All assets should be staked first.
2. The bot doesn't support creatures.
3. No building upgrades, only workers.
4. No way to open buildings for other shifts.
5. No handy way to pause some activities e.g. external renting but you can comment lines in the file `./src/novopangea/playGameCalcNextAction.js`

## Donations 💵💵💵
This is purely enthusiastic project and open source. You can use it for free.

If you'd like the bot please support me by sending crypto or assets to my wallet: [ete2o.c.wam](https://waxblock.io/account/ete2o.c.wam)

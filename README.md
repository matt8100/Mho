![GitHub last commit (branch)](https://img.shields.io/github/last-commit/matt8100/Mho/staging)
![GitHub](https://img.shields.io/github/license/matt8100/Mho)

# Mho

Mho is a Discord bot for engineering students at UofT.

Requires:
- [Node.js 14.0.0 or newer](https://nodejs.org/en/)

This bot uses [Discord.js](https://discord.js.org/#/) and the [Commando framework](https://github.com/discordjs/Commando)

## Commands

```shell
calendar|cal query
course|c course-code
exam|e course-code
info|i [key] # Providing no key lists all available keys
infoedit|ie {add|edit|delete} key [value]
```

## Setup

This bot uses Redis for caching web requests, but it is not required. If you want caching, you can [download Redis here](https://redis.io/download), or with [brew on Mac](https://gist.github.com/tomysmile/1b8a321e7c58499ef9f9441b2faa0aa8)

Set `BOT_TOKEN` in a `.env` file within the root directory and run

```
npm i
node .
```

### Hosting

If you'd like to host this bot on a 24/7 basis, there are a multitude of services that offer some form of free hosting, such as [Heroku](https://www.heroku.com/) or [Google Cloud](https://cloud.google.com/appengine). You can also consider self-hosting, in which case using [pm2](https://pm2.keymetrics.io/docs/usage/quick-start/) to daemonize your app and configure startup scripts is recommended.

## Contributing

Interested in contributing? Great! You can first open up an [issue](https://github.com/matt8100/Mho/issues) for what you want to add or fix to see if it is something that would be useful for the bot. Afterwards, you can fork this repo and start developing.

### Beginners

- The [Discord.js guide](https://discordjs.guide/#before-you-begin) provides great resources, and helps you code a bot from start to finish.
- There are a number of resources for learning Git. You can check out the official [Git book](https://git-scm.com/book/en/v2), [video tutorials from GitKraken](https://www.gitkraken.com/learn/git/tutorials), and an [interactive Git branching guide](https://learngitbranching.js.org/).

### Tips

- Use [nodemon](https://www.npmjs.com/package/nodemon) to facilitate testing changes.
- Use [ESLint](https://eslint.org/) for code style and consistency. It makes it easier for all of us if things stay consistent.
- There are some VS Code snippets provided for commands, events and embeds.
- SQLite is used for data persistence. [DB4S](https://sqlitebrowser.org/) is a useful tool for viewing and editing SQLite database files.

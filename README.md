## Syntrack Authors
- Thomas Hudspith-Tatham (@tomatau)
- James Jenkins (@jamesjenkinsjr)
- Alexander Fukui (@psychicbologna)

Client:  
   - Live: https://alexander-jamesj-spaced-repetition.alexanderfukui.now.sh
   - Code: https://github.com/thinkful-ei-gecko/alexander-jamesj-spaced-repetition

Server: 
   - Code: https://syntrack-api.herokuapp.com/api


## Description
This API supports Syntrack - a spaced repetition application aimed at helping users learn new languages via reviewing words and phrases. The seed data currently sets up a database with Russian, but can be adapted to other languages with minimal effort

## Endpoints

### Public Routes
- POST /api/user/
   - Given a username, name and password, will validate information and create a new user in the database along with affiliated language and word table data
- POST /api/auth/token
   - Given valid existing username and password, responds with a JWT token for authenticating user to use private endpoints

### Private Routes
- PUT /api/auth/
   - When authenticated as a user, allows for replacing existing JWTs with new ones
- GET /api/language/
   - When authenticated as a user and with valid language id, retrieves associated word data from the word table for a user
- GET /api/language/head
   - When authenticated as a user with valid language id, retrieves the current word data matching the value of language.head
   - This id represensts the word to present next to a user for the purposes of the client app
- POST /api/language/guess
   - When authenticated as a user, accepts a guess parameter in the request body
   - The guess will be compared against the current word corresponding to the language head value and, depending on whether it matches the word's translation, will update the word as well as other words to modify the head and the sequencing of all other words by way of a memory_value in the word table

## Technologies
- NodeJS
- Express
- PostgreSQL

## Local dev setup

If using user `dunder-mifflin`:

```bash
mv example.env .env
createdb -U dunder-mifflin spaced-repetition
createdb -U dunder-mifflin spaced-repetition-test
```

If your `dunder-mifflin` user has a password be sure to set it in `.env` for all appropriate fields. Or if using a different user, update appropriately.

```bash
npm install
npm run migrate
env MIGRATION_DB_NAME=spaced-repetition-test npm run migrate
```

And `npm test` should work at this point

## Configuring Postgres

For tests involving time to run properly, configure your Postgres database to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   1. E.g. for an OS X, Homebrew install: `/usr/local/var/postgres/postgresql.conf`
   2. E.g. on Windows, _maybe_: `C:\Program Files\PostgreSQL\11.2\data\postgresql.conf`
   3. E.g  on Ubuntu 18.04 probably: '/etc/postgresql/10/main/postgresql.conf'
2. Find the `timezone` line and set it to `UTC`:

```conf
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests mode `npm test`

Run the migrations up `npm run migrate`

Run the migrations down `npm run migrate -- 0`

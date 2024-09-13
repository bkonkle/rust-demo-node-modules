# High-Performance Node Modules with Rust

WIP

```sh
npm i
```

## Pre-commit

```sh
sudo apt install pre-commit
# or...
yay -S pre-commit
# or...
pipx install pre-commit
# or...
brew install pre-commit

pre-commit install
```

## Run on Local Machine

First, issue yourself a token:

```sh
npm run token
```

Then, run the local dev server:

```sh
npm run dev
```

Now, make a `GET /me` call with your access token in the `Authorization` header with a "Bearer" prefix.

You should get back a 200 response, indicating that the JWT token was validated.

## Run Benchmarks

Issue a token:

```sh
rpm run token
```

Assign the access token to the `ACCESS_TOKEN` environment variable:

```sh
export AUTH_TOKEN="Bearer {access_token}"
```

Run the benchmarks:

```sh
npm run bench
```

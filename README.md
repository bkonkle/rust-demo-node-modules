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
USE_RUST_MODULE=false npm run dev
```

Now, make a `GET /me` call with your access token in the `Authorization` header with a "Bearer" prefix.

You should get back a 200 response, indicating that the JWT token was validated.

## Set up Torch for AI Querying

Install `libtorch` with the cxx11 ABI for use within the Rust module, and place it in `~/lib/libtorch`:

```sh
export VERSION=2.4.1
export CUDA_VERSION=cu124

wget https://download.pytorch.org/libtorch/$CUDA_VERSION/libtorch-cxx11-abi-shared-with-deps-$VERSION%2B$CUDA_VERSION.zip
unzip libtorch-cxx11-abi-shared-with-deps-$VERSION+$CUDA_VERSION.zip
rm libtorch-cxx11-abi-shared-with-deps-$VERSION+$CUDA_VERSION.zip

mv libtorch ~/lib
```

Then export some variables in your `.envrc` to point to it:

```sh
export LIBTORCH=~/lib/libtorch
export LD_LIBRARY_PATH=${LIBTORCH}/lib:$LD_LIBRARY_PATH

export LIBTORCH_BYPASS_VERSION_CHECK=1
```

The `LIBTORCH_BYPASS_VERSION_CHECK` allows patch version `2.4.1` to be used where `2.4.0` is expected.

## Compile the Rust modules

```sh
npm run build.jwt-rsa

npm run build.text-classification
```

This should generate a `lib/jwt_rsa/jwt-rsa.<platform>.<arch>.node` file, with an `index.js` and an `index.d.ts` alongside it, and a similar file for the text-classification project. This is how you import the Rust modules into your Node.js application.

Run the local dev server with the rust module enabled:

```sh
USE_RUST_MODULE=true npm run dev
```

## Fine-Tune the Model

Before you can query it, you need to take the base Bert uncased model and fine-tune it with the Snips dataset.

You'll need to create and activate a virtualenv for dependencies like "torch" to be available. With Poetry:

```sh
npm run poetry install

source $(npm run --silent poetry-path)/bin/activate
```

Then, run the fine-tuning script:

```sh
npm run train-text-classification -- --num-epochs 2
```

To convert the resulting model for usage with Rust, it's easiest to [use the `rust-bert` library directly](https://github.com/guillaume-be/rust-bert/tree/main?tab=readme-ov-file#loading-pretrained-and-custom-model-weights):

```sh
# Activate the virtual environment so that Torch is available
source $(npm run --silent poetry-path)/bin/activate

# Then switch to the path you've cloned the rust-bert library to
cd /path/to/rust-bert

python utils/convert_model.py path/to/data/snips-bert/pytorch_model.bin
```

You should see a `rust_model.ot` file in the `data/snips-bert` directory afterwards. This will be what the Rust process uses.

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

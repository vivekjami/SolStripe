# sol-stripe
What is sol-stripe - here's a video walkthrough of all this code: []()

**Jupiter Terminal vs API**
[Jupiter Terminal](https://terminal.jup.ag/) is a UI that you can plug into your app by linking it in your HTML. The API is uses Jupiter's quote and swap endpoints and requires you build your own front-end/UI.  

## Usage
The code in this repo is a reference imeplementation, it's not built for direct usage.

- Get an API key from Helius - https://www.helius.dev/
- Add your key to the the HTML OR create-solana-dapp implementation


I recommend watching the video linked above to get an idea of the layout of the code and how the Jupiter swap API works.
 
### HTML
Plain HTML file that imports the terminal via CDN. 

### Create-solana-dapp
Uses the [create-solana-dapp](https://github.com/solana-developers/create-solana-dapp) template to create a new project, then imports the terminal via CDN.

#### Setup
Run these in your terminal:
```
git clone https://github.com/vivekjami/SolStripe
cd create-solana-dapp
cd web
```
then to install packages:
(recommended)
```
yarn
yarn run dev
```
or
```
npm i 
npm run dev 
```

Open `localhost:3000` in your browser.

### API Implementation
The API implementation is at [create-solana-dapp/web/app/swap/page.tsx](https://github.com/vivekjami/SolStripe/blob/main/create-solana-dapp/web/app/swap/page.tsx).you can use the [token list API](https://station.jup.ag/docs/token-list/token-list-api) for validated tokens.

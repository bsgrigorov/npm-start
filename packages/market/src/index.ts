import YahooFinance from 'yahoo-finance2'

import { fetchQuote, fetchQuotes, type QuoteFetcher } from './fetch-quote.js'

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
  logger: {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    dir: () => {},
  },
})

const defaultFetcher: QuoteFetcher = {
  quote: (symbol, queryOptions) =>
    yahooFinance.quote(symbol, queryOptions ?? {}, { validateResult: false }),
}

export { fetchQuote, fetchQuotes }
export type { MarketQuote, QuoteFetcher } from './fetch-quote.js'

/** Fetch one quote using the default Yahoo Finance client. */
export async function fetchMarketQuote(symbol: string) {
  return fetchQuote(symbol, defaultFetcher)
}

/** Fetch many quotes using the default Yahoo Finance client. */
export async function fetchMarketQuotes(symbols: string[]) {
  return fetchQuotes(symbols, defaultFetcher)
}

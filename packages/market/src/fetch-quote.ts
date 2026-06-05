export type MarketQuote = {
  symbol: string
  shortName: string
  price: number
  currency: string
}

export type QuoteFetcher = {
  quote: (
    symbol: string,
    queryOptions?: Record<string, unknown>,
    moduleOptions?: { validateResult?: boolean },
  ) => Promise<{
    shortName?: string
    longName?: string
    regularMarketPrice?: number
    currency?: string
  } | null>
}

/**
 * Fetch a single market quote from Yahoo Finance.
 */
export async function fetchQuote(
  symbol: string,
  fetcher: QuoteFetcher,
): Promise<MarketQuote> {
  const normalized = symbol.trim().toUpperCase()
  if (!normalized) {
    throw new Error('symbol is required')
  }

  const quote = await fetcher.quote(
    normalized,
    {},
    { validateResult: false },
  )

  if (quote == null) {
    throw new Error(`no quote returned for ${normalized}`)
  }

  const price = quote.regularMarketPrice
  if (price == null || Number.isNaN(price)) {
    throw new Error(`missing price for ${normalized}`)
  }

  return {
    symbol: normalized,
    shortName: quote.shortName ?? quote.longName ?? normalized,
    price,
    currency: quote.currency ?? 'USD',
  }
}

/**
 * Fetch quotes for multiple symbols. Failed symbols are omitted.
 */
export async function fetchQuotes(
  symbols: string[],
  fetcher: QuoteFetcher,
): Promise<MarketQuote[]> {
  const results = await Promise.allSettled(
    symbols.map((symbol) => fetchQuote(symbol, fetcher)),
  )

  return results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  )
}

import { describe, expect, it, vi } from 'vitest'

import { fetchQuote, fetchQuotes, type QuoteFetcher } from './fetch-quote.js'

function createFetcher(
  impl: QuoteFetcher['quote'],
): QuoteFetcher {
  return { quote: vi.fn(impl) }
}

describe('fetchQuote', () => {
  it('returns normalized quote data', async () => {
    const fetcher = createFetcher(async () => ({
      shortName: 'Apple Inc.',
      regularMarketPrice: 190.5,
      currency: 'USD',
    }))

    await expect(fetchQuote('aapl', fetcher)).resolves.toEqual({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      price: 190.5,
      currency: 'USD',
    })
  })

  it('rejects empty symbols', async () => {
    const fetcher = createFetcher(async () => ({
      regularMarketPrice: 1,
    }))

    await expect(fetchQuote('  ', fetcher)).rejects.toThrow(
      'symbol is required',
    )
  })

  it('rejects missing prices', async () => {
    const fetcher = createFetcher(async () => ({
      shortName: 'Broken',
    }))

    await expect(fetchQuote('TEST', fetcher)).rejects.toThrow(
      'missing price for TEST',
    )
  })
})

describe('fetchQuotes', () => {
  it('skips failed symbols', async () => {
    const fetcher = createFetcher(async (symbol) => {
      if (symbol === 'BAD') {
        return null
      }

      return {
        shortName: symbol,
        regularMarketPrice: 10,
        currency: 'USD',
      }
    })

    await expect(fetchQuotes(['GOOD', 'BAD'], fetcher)).resolves.toEqual([
      {
        symbol: 'GOOD',
        shortName: 'GOOD',
        price: 10,
        currency: 'USD',
      },
    ])
  })
})

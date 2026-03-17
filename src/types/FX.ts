/**
 FX, global namespace for all app interfaces and types
 */

export namespace FX {

    // Shared used across both customer and admin 
    export namespace Shared {
      export interface Currency {
        code: string
        name: string
        symbol: string
        flag: string
      }
  
      export interface MarketPair {
        pair: string
        rate: string
        change_pct: string
      }
  
      export interface MarketSnapshot {
        market_snapshot: MarketPair[]
      }

      export interface FullCurrency extends Currency {
        id: number
        enabled: boolean
      }
      
      export interface CurrenciesResponse {
        currencies: FullCurrency[]
      }
    }
  
    // Customer
    export namespace Customer {
  
      export interface DashboardSummary {
        portfolio_value_gbp: string
        num_currencies: number
        change_24h_pct: string
        change_24h_gbp: string
      }
  
      export interface DashboardMarketPair {
        pair: string
        base_flag: string
        quote_flag: string
        rate: string
        change_pct: string
      }
  
      export interface DashboardMarketSnapshot {
        market_snapshot: DashboardMarketPair[]
      }
  
      export interface PortfolioHolding {
        currency: Shared.Currency
        amount: string
        avg_buy_rate: string
        gbp_value: string | null
      }
  
      export interface Portfolio {
        holdings: PortfolioHolding[]
        total_value_gbp: string
      }

      export interface Pair {
        id: number
        pair: string
        base: Shared.Currency
        quote: Shared.Currency
        rate: string
        change_pct: string
      }
      
      export interface PairsResponse {
        pairs: Pair[]
      }

      export interface Order {
        id: number
        pair: string
        side: "buy" | "sell"
        amount: string
        limit_rate: string
        status: "open" | "filled" | "cancelled"
        created_at: string
        updated_at: string
      }
      
      export interface OrdersResponse {
        orders: Order[]
      }
      
      export interface Trade {
        id: number
        pair: string
        side: "buy" | "sell"
        amount: string
        rate: string
        total: string
        executed_at: string
      }
      
      export interface TradesResponse {
        trades: Trade[]
      }
      
      export type TabStatus = "all" | "open" | "filled" | "cancelled"
      
    }
  
    // Admin- add interfaces here as you migrate admin pages
    export namespace Admin {
      // todo populate as admin pages get refactored
    }
  
  }
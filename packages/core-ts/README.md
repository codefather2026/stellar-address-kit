# stellar-address-kit (TypeScript)

The TypeScript reference implementation of the Stellar Address Kit for secure deposit routing and address interop.

```bash
npm install stellar-address-kit
```

Part of a multi-language suite also available in **[Go](https://github.com/Boxkit-Labs/stellar-address-kit/tree/main/packages/core-go)** and **[Dart](https://github.com/Boxkit-Labs/stellar-address-kit/tree/main/packages/core-dart)**.

---

### 📖 Documentation & Guides
- [TypeScript: Reconciling Deposits with Missing Memos](https://github.com/Boxkit-Labs/stellar-address-kit/blob/main/docs/guides/reconciling-deposits-missing-memo.md)
- [TypeScript: Pooled Accounts & Muxed Deposits](https://github.com/Boxkit-Labs/stellar-address-kit/blob/main/docs/guides/pooled-accounts-muxed-deposits.md)
- [General: Compatibility Reference](https://github.com/Boxkit-Labs/stellar-address-kit/blob/main/docs/guides/compatibility-reference.md)

---

## Quick Start

```typescript
import { extractRouting } from 'stellar-address-kit';

const result = extractRouting({
  destination: 'MA7QYNF7SOWQ3GLR2B6RS22TBGZAOR6KLYH4PA5ZAM73A3H4K2HZZSQUVRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRTD6',
  memoType: 'none',
  memoValue: null,
  sourceAccount: 'GA...'
});

if (!result.destinationError) {
  console.log('Routing ID:', result.routingId); // "123456789"
  console.log('Source:', result.routingSource); // "muxed"
}
```

## CLI Debugger

After building or installing the package, you can inspect routing behavior from the terminal:

```bash
stellar-route --dest G... --memo 123 --type id
```

The command prints the `RoutingResult` object as pretty JSON, which is useful for checking muxed-address precedence, memo normalization, and routing warnings without writing a scratch script.

## Documentation

For full guides, integration examples, and deep dives into the routing logic, see our [comprehensive Guides](https://github.com/Boxkit-Labs/stellar-address-kit/tree/main/docs/guides).

## License

MIT

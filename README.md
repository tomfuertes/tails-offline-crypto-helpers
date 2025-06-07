# 🔐 Tails Offline Crypto Helpers

A curated collection of offline cryptocurrency tools and utilities designed for secure, air-gapped environments like Tails OS. This project bundles essential crypto tools that can be easily transferred to a USB drive and used without internet connectivity.

## 🎯 Purpose

This toolkit is specifically designed for:
- **Maximum Security**: All tools work offline to eliminate network-based attack vectors
- **Tails OS Compatibility**: Optimized for use in the Tails operating system
- **Portable Deployment**: Everything fits on a USB drive for easy transport
- **Cryptocurrency Operations**: Key generation, mnemonic handling, and wallet operations
- **Air-Gapped Environments**: Perfect for cold storage and secure key management

## 📦 What's Included

### 🔑 Key Generation & Mnemonic Tools
- **Ian Coleman BIP39**: Industry-standard BIP39 mnemonic generator and validator
- **Ian Coleman Shamir**: Shamir's Secret Sharing implementation
- **Ian Coleman SLIP39**: SLIP39 mnemonic shares for advanced secret splitting
- **Ian Coleman EIP2333**: Ethereum 2.0 key derivation
- **Bitaps Mnemonic Tool**: Alternative mnemonic generation interface
- **Custom Dice Roll Calculator**: Generate entropy from physical dice rolls

### 📝 Wordlists & References
- **BIP39 English Wordlist**: Official 2048-word list for BIP39 mnemonics
- **SLIP39 Wordlist**: Word list for SLIP39 mnemonic shares
- Complete offline reference materials

### 🛠️ Blockchain Tools & CLIs
- **Ethereum Staking CLI**: Official Ethereum 2.0 deposit CLI tools
- **RocketPool CLI**: RocketPool staking utilities
- **Wagyu Key Gen**: User-friendly Ethereum key generation GUI
- **Solana CLI Tools**: Solana blockchain utilities
- **Node.js Runtime**: For running JavaScript-based tools

### 🔧 Development Libraries
- **SLIP39-JS**: JavaScript implementation of SLIP39
- **Various Crypto Libraries**: Supporting libraries for advanced operations

## 🚀 Quick Start

### Prerequisites
- Tails OS (recommended) or any Linux distribution
- Bun runtime (included in build process)
- USB drive with sufficient space (~500MB)

### Building the Collection

```bash
# Clone the repository
git clone https://github.com/your-username/tails-offline-crypto-helpers.git
cd tails-offline-crypto-helpers

# Either bun install or npm install bun && npx bun install...

# Install dependencies and build tools
bun install

# Download and build all resources
bun run build

# The complete toolkit will be in dist/
```

### Deployment to USB Drive

```bash
# Copy everything to your USB drive
cp -r dist/* /path/to/your/usb/drive/

# Or create a compressed archive
tar -czf crypto-toolkit.tar.gz -C dist/prebuilt-resources .
```

## 🔒 Security Best Practices

### ⚠️ Critical Security Guidelines

1. **Always Use Offline**: Disconnect from internet before using any tools
2. **Verify Checksums**: Validate all downloaded tools before use
3. **Use Tails OS**: Boot from Tails for maximum security and privacy
4. **Physical Security**: Keep USB drives in secure locations
5. **Test First**: Practice with small amounts before real operations
6. **Multiple Backups**: Create redundant copies of important keys/seeds

### 🛡️ Recommended Workflow

1. Boot into Tails OS (offline mode)
2. Insert USB drive with crypto toolkit
3. Perform key generation/operations
4. Securely store results (bank vaults, friends, multiple locations)
5. Tails will wipe temporary files before shutdown

## 📋 Tool Descriptions

### BIP39 Tools
Generate and validate Bitcoin Improvement Proposal 39 mnemonics for hierarchical deterministic wallets.

### Shamir Secret Sharing
Split sensitive data into multiple shares where a threshold number of shares can reconstruct the original secret.

### SLIP39 (Shamir's Secret-Sharing for Mnemonic Codes)
Advanced mnemonic sharing system that improves upon traditional Shamir's Secret Sharing.

### Ethereum Staking Tools
Complete toolkit for Ethereum 2.0 validator key generation and deposit file creation.

## 🔧 Development

### Building from Source

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run the resource download script
bun scripts/resources.ts

# Build custom tools
bun run build:tools
```

### Adding New Tools

1. Add download URLs to `scripts/resources.ts`
2. Update validation logic if needed
3. Test thoroughly in offline environment
4. Update documentation

## 📊 Resource Summary

The build process automatically generates a summary table showing:
- File sizes and types
- Validation status
- Content previews
- Organization by category

## ⚖️ Legal & Disclaimer

**IMPORTANT**: This toolkit is for educational and legitimate cryptocurrency operations only.

- Use responsibly and in compliance with local laws
- Verify all tools independently before use
- No warranty provided - use at your own risk
- Always test with small amounts first
- Keep backups of important data

## 🤝 Contributing

Contributions welcome! Please:
1. Test thoroughly in offline environments
2. Follow security best practices
3. Update documentation
4. Verify all external resources

## 📞 Support

For issues or questions:
- Check existing GitHub issues
- Review security guidelines
- Test in safe environment first
- Provide detailed error information

---

**Remember**: Cryptocurrency security is paramount. When in doubt, consult multiple sources and always prioritize security over convenience.

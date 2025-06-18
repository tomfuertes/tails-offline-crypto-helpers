import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  // generateMnemonic,
  // mnemonicToEntropy,
  // entropyToMnemonic,
  validateMnemonic,
  mnemonicToSeed,
} from "web-bip39";
import wordlist from "web-bip39/wordlists/english";
import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import { HDKey } from "micro-ed25519-hdkey";

interface AddressData {
  eth: string;
  solana: string;
}

const App = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Validate mnemonic as user types
  useEffect(() => {
    const validateMnemonicAsync = async () => {
      if (mnemonic.trim() === "") {
        setIsValid(null);
        return;
      }
      setIsValid(await validateMnemonic(mnemonic.trim(), wordlist));
    };

    validateMnemonicAsync();
  }, [mnemonic]);

  const generateAddresses = async () => {
    if (!(await validateMnemonic(mnemonic.trim(), wordlist))) {
      return;
    }

    setIsGenerating(true);
    const newAddresses: AddressData[] = [];

    // Create root HD wallet from seed
    const seed = await mnemonicToSeed(mnemonic.trim());
    const rootWallet = ethers.HDNodeWallet.fromSeed(seed);

    // Generate 5 addresses for each currency
    for (let i = 0; i < 5; i++) {
      // Ethereum address (using BIP44 path for Ethereum)
      const ethWallet = rootWallet.derivePath(`m/44'/60'/0'/0/${i}`);
      const ethAddress = ethWallet.address;

      // Solana address (using BIP44 path for Solana)
      const solanaDerivationPath = `m/44'/501'/${i}'/0'`;
      const hd = HDKey.fromMasterSeed(seed);
      const child = hd.derive(solanaDerivationPath);
      const solanaKeypair = Keypair.fromSeed(child.privateKey);
      const solanaAddress = solanaKeypair.publicKey.toBase58();

      newAddresses.push({
        eth: ethAddress,
        solana: solanaAddress,
      });
    }

    setAddresses(newAddresses);
    setIsGenerating(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      generateAddresses();
    }
  };

  const getValidationColor = () => {
    if (isValid === null) return "#666";
    return isValid ? "#22c55e" : "#ef4444";
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Crypto Address Generator</h1>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            color: getValidationColor(),
          }}
        >
          Mnemonic Phrase {isValid === false && "(Invalid)"}
          {isValid === true && "(Valid)"}
        </label>
        <textarea
          value={mnemonic}
          onInput={(e) => setMnemonic((e.target as HTMLTextAreaElement).value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your mnemonic phrase here... (Press Cmd+Return to generate addresses)"
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "12px",
            border: `2px solid ${getValidationColor()}`,
            borderRadius: "8px",
            fontSize: "16px",
            fontFamily: "monospace",
            resize: "vertical",
          }}
        />
        <small style={{ color: "#666", marginTop: "4px", display: "block" }}>
          Press <kbd>Cmd+Return</kbd> (Mac) or <kbd>Ctrl+Return</kbd>{" "}
          (Windows/Linux) to generate addresses
        </small>
      </div>

      {isGenerating && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#666",
          }}
        >
          Generating addresses...
        </div>
      )}

      {addresses.length > 0 && !isGenerating && (
        <div>
          <h2 style={{ marginBottom: "16px" }}>Generated Addresses</h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e5e5e5" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Ethereum (ETH)
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Solana (SOL)
                  </th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((addr, index) => (
                  <tr
                    key={index}
                    style={{
                      borderTop: index > 0 ? "1px solid #ddd" : "none",
                    }}
                  >
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {index + 1}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        wordBreak: "break-all",
                      }}
                    >
                      {addr.eth}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        wordBreak: "break-all",
                      }}
                    >
                      {addr.solana}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

render(<App />, document.getElementById("app")!);

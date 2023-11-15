import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

import './App.css'; // Import your CSS file

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState(null); // Added state for transaction ID
  const [networks, setNetworks] = useState([]); // Added state for storing multiple networks

  // New state variables for network details
  const [newNetworkName, setNewNetworkName] = useState('');
  const [newRpcUrl, setNewRpcUrl] = useState('');
  const [newChainId, setNewChainId] = useState('');
  const [newCurrencySymbol, setNewCurrencySymbol] = useState('');
  const [newBlockExplorerUrl, setNewBlockExplorerUrl] = useState('');

  useEffect(() => {
    const getNetwork = async () => {
      if (web3) {
        // Try to get the network name from local storage
        const storedNetworkName = localStorage.getItem('networkName');

        if (storedNetworkName) {
          setNetwork(storedNetworkName);
        } else {
          const networkId = await web3.eth.net.getId();
          const networkName = getNetworkName(networkId);
          setNetwork(networkName);

          // Save the network name to local storage
          localStorage.setItem('networkName', networkName);
        }
      }
    };

    getNetwork();
  }, [web3]);

  useEffect(() => {
    const handleNetworkChange = () => {
      window.ethereum.on('networkChanged', (newNetworkId) => {
        const newNetworkName = getNetworkName(newNetworkId);
        setNetwork(newNetworkName);

        // Save the new network name to local storage
        localStorage.setItem('networkName', newNetworkName);
      });
    };

    if (web3) {
      handleNetworkChange();

      return () => {
        window.ethereum.removeListener('networkChanged', handleNetworkChange);
      };
    }
  }, [web3]);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(web3Instance);
        } catch (error) {
          console.error('User denied account access');
        }
      } else if (window.web3) {
        const web3Instance = new Web3(window.web3.currentProvider);
        setWeb3(web3Instance);
      } else {
        console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    };

    loadWeb3();
  }, []);

  useEffect(() => {
    const loadAccountData = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    };

    loadAccountData();
  }, [web3]);

  const copyToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = account;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    setIsCopied(true);

    // Reset the "Copied" message after a short delay
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  useEffect(() => {
    const getBalance = async () => {
      if (web3 && account) {
        const balanceWei = await web3.eth.getBalance(account);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        setBalance(balanceEth);
      }
    };

    getBalance();
  }, [web3, account]);

  useEffect(() => {
    const handleNetworkChange = () => {
      window.ethereum.on('networkChanged', (newNetworkId) => {
        setNetwork(getNetworkName(newNetworkId));
      });
    };

    if (web3) {
      handleNetworkChange();

      return () => {
        window.ethereum.removeListener('networkChanged', handleNetworkChange);
      };
    }
  }, [web3]);

  const getNetworkName = (networkId) => {
    switch (networkId) {
      case '1':
        return 'Mainnet';
      case '3':
        return 'Ropsten';
      case '4':
        return 'Rinkeby';
      case '5':
        return 'Goerli';
      case '42':
        return 'Kovan';
      case '56':
        return 'BSC Mainnet';
      case '97':
        return 'BSC Testnet';
      case '1284':
        return 'Moonbeam Testnet';
      case '80001':
        return 'Mumbai Testnet (Polygon)';
      case '137':
        return 'Matic Mainnet (Polygon)';
      case '1666700000':
        return 'Fantom Opera Mainnet';
      case '250':
        return 'Fantom Testnet';
      default:
        return 'Unknown Network';
    }
  };

  const handleRecipientChange = (event) => {
    setRecipient(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const sendFunds = async () => {
    try {
      // Validate recipient and amount
      if (!web3.utils.isAddress(recipient)) {
        alert('Invalid recipient address');
        return;
      }

      if (isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Invalid amount');
        return;
      }

      // Convert amount to wei
      const amountWei = web3.utils.toWei(amount, 'ether');

      // Send transaction
      const transaction = await web3.eth.sendTransaction({
        from: account,
        to: recipient,
        value: amountWei,
      });

      // Set transaction ID and show it to the user
      setTransactionId(transaction);

      alert(`Transaction sent: ${transaction.transactionHash}`);
    } catch (error) {
      console.error('Error sending funds:', error);
    }
  };

  // Function to handle changes in network details input fields
  const handleNetworkDetailsChange = (field, value) => {
    switch (field) {
      case 'networkName':
        setNewNetworkName(value);
        break;
      case 'rpcUrl':
        setNewRpcUrl(value);
        break;
      case 'chainId':
        setNewChainId(value);
        break;
      case 'currencySymbol':
        setNewCurrencySymbol(value);
        break;
      case 'blockExplorerUrl':
        setNewBlockExplorerUrl(value);
        break;
      default:
        break;
    }
  };

  // Function to add a new network
  const addNetwork = () => {
    // Validate that all required fields are filled
    if (
      !newNetworkName ||
      !newRpcUrl ||
      !newChainId ||
      !newCurrencySymbol ||
      !newBlockExplorerUrl
    ) {
      alert('Please fill in all network details.');
      return;
    }

    // Create a new network object
    const newNetwork = {
      name: newNetworkName,
      rpcUrl: newRpcUrl,
      chainId: newChainId,
      currencySymbol: newCurrencySymbol,
      blockExplorerUrl: newBlockExplorerUrl,
    };

    // Update the network state with the new network
    setNetworks((prevNetworks) => [...prevNetworks, newNetwork]);

    // Reset the input fields
    setNewNetworkName('');
    setNewRpcUrl('');
    setNewChainId('');
    setNewCurrencySymbol('');
    setNewBlockExplorerUrl('');

    alert('New network added successfully.');
  };

  const addNetworkToMetaMask = () => {
    // Создайте объект с параметрами вашей сети
    const newNetwork = {
      chainId: `0x${parseInt(newChainId, 10).toString(16)}`, // Преобразуйте Chain ID в шестнадцатеричный формат
      chainName: newNetworkName,
      nativeCurrency: {
        name: 'ETH',
        symbol: newCurrencySymbol,
        decimals: 18,
      },
      rpcUrls: [newRpcUrl],
      blockExplorerUrls: [newBlockExplorerUrl],
    };

    // Запросите у пользователя добавление сети в MetaMask
    window.ethereum
      .request({
        method: 'wallet_addEthereumChain',
        params: [newNetwork],
      })
      .then(() => {
        alert('Network added to MetaMask!');
      })
      .catch((error) => {
        console.error('Error adding network to MetaMask:', error);
        alert('Failed to add network to MetaMask. Please add it manually through MetaMask settings.');
      });
  };

  return (
    <div className="wallet-container">
      <h1>WalletApp</h1>
      {web3 ? (
        <>
          <div className="account-info">
            <p>
              Connected Account: {account}
              <button onClick={copyToClipboard}>Copy Address</button>
              {isCopied && <span className="copied-message">Copied!</span>}
            </p>
            <p>Account Balance: {balance} ETH</p>

            {/* Displaying all available networks */}
            {networks.map((network, index) => (
              <div key={index}>
                <p>{`Network ${index + 1}: ${network.name}`}</p>
              </div>
            ))}

            <p>Network: {network}</p>
          </div>

          {/* Add form for sending funds */}
          <div className="send-funds-form">
            <h2>Send Funds</h2>
            <label>Recipient Address:</label>
            <input type="text" value={recipient} onChange={handleRecipientChange} />
            <label>Amount (ETH):</label>
            <input type="text" value={amount} onChange={handleAmountChange} />
            <button onClick={sendFunds}>Send</button>
          </div>


          {/* Display transaction ID */}
          {transactionId && (
            <div className="transaction-info">
              <h2>Transaction ID</h2>
              <p>{transactionId.transactionHash}</p>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(transactionId.transactionHash)
                }
              >
                Copy Transaction ID
              </button>
              {isCopied && <span className="copied-message">Copied!</span>}
            </div>
          )}

          {/* Add form for network details */}
          <div className="network-form">
            <h2>Add Network</h2>
            <label>Network Name:</label>
            <input
              type="text"
              value={newNetworkName}
              onChange={(e) => handleNetworkDetailsChange('networkName', e.target.value)}
            />
            <label>New RPC URL:</label>
            <input
              type="text"
              value={newRpcUrl}
              onChange={(e) => handleNetworkDetailsChange('rpcUrl', e.target.value)}
            />
            <label>Chain ID:</label>
            <input
              type="text"
              value={newChainId}
              onChange={(e) => handleNetworkDetailsChange('chainId', e.target.value)}
            />
            <label>Currency Symbol:</label>
            <input
              type="text"
              value={newCurrencySymbol}
              onChange={(e) => handleNetworkDetailsChange('currencySymbol', e.target.value)}
            />
            <label>Block Explorer URL:</label>
            <input
              type="text"
              value={newBlockExplorerUrl}
              onChange={(e) => handleNetworkDetailsChange('blockExplorerUrl', e.target.value)}
            />
            <button onClick={addNetwork}>Add Network to App</button>
            <button onClick={addNetworkToMetaMask}>Add Network to MetaMask</button>
          </div>

          
        </>
      ) : (
        <p>Please install MetaMask to use this application.</p>
      )}
    </div>
  );
};

export default App;

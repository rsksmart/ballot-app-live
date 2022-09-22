import { useState } from 'react';
import { BigNumber, providers, utils, Contract, Signer, ContractTransaction } from 'ethers'
import './App.css';
import { TransactionReceipt } from '@ethersproject/abstract-provider';

declare global {
  interface Window {
    ethereum: any;
  }
}

const sorteoAbi = [
  'function cantSuscriptos() external view returns(uint)',
  'function suscripto(uint i) external view returns(address)',
  'function suscribirse() external'
]

function App() {
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState<BigNumber>()

  const [sorteo, setSorteo] = useState<Contract>()

  const [suscriptos, setSuscriptos] = useState<string[]>([])

  const [tx, setTx] = useState<ContractTransaction>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()

  const login = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAddress(accounts[0])

    const signer = new providers.Web3Provider(window.ethereum).getSigner()
    const balance = await signer.getBalance()
    setBalance(balance)

    const sorteo = new Contract('0x079653C904BAbaDf9eb625Ab07a8766aA75BE613', sorteoAbi).connect(signer!)

    setSorteo(sorteo)
  }

  const obtenerSuscritos = async () => {

    const cant = await sorteo!.cantSuscriptos()

    const suscriptos = []

    for (let i = 0; i < cant; i++) {
      const suscripto = await sorteo!.suscripto(i)
      suscriptos.push(suscripto)
    }

    setSuscriptos(suscriptos)
  }

  const suscribirse = async () => {
    const tx = await sorteo!.suscribirse()

    setTx(tx)

    const receipt = await tx.wait()

    setReceipt(receipt)
  }

  return (
    <div className="App">
      <h1>Hola mundo :D</h1>

      {typeof window.ethereum === 'undefined' && <p>Por favor instalar Metamask</p>}

      <button onClick={login}>login</button>

      {!!address && <>
        <p>Address: {address}</p>
        <p>Balance: {!!balance && utils.formatEther(balance)} RBTC</p>

        <button onClick={obtenerSuscritos}>obtener suscritos</button>

        {suscriptos.map((s) => <p key={s}>{s}</p>)}

        <button onClick={suscribirse}>suscribirse</button>
        {!!tx && <p><a href={`https://explorer.testnet.rsk.co/tx/${tx.hash}`} target="_blank">{tx.hash}</a></p>}
        {!!receipt && <p>{receipt.status}</p>}
      </>}
    </div>
  );
}

export default App;

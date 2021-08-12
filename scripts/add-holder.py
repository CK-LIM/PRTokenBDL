import json
from web3 import Web3, HTTPProvider
from web3.logs import STRICT, IGNORE, DISCARD, WARN
from typing import List
from math import *
import pandas as pd
import csv
from ast import literal_eval

#Connect Ethereum node 
# ganache_url = "http://127.0.0.1:7545"
# web3 = Web3(HTTPProvider(ganache_url,request_kwargs={'timeout':60}))
infuraKey = '0866de87b4de4c7f843156d964c88c0a'
infura = "https://rinkeby.infura.io/v3/"+infuraKey
web3 = Web3(Web3.HTTPProvider(infura))  
 
# web3 = Web3(Web3.HTTPProvider("https://eth-mainnet.functionx.io"))
print(web3.isConnected())
print(web3.eth.blockNumber)
latestBlk = web3.eth.blockNumber

compiled_contract_path = 'src/abis/PurseDistribution.json'
deployed_contract_address = web3.toChecksumAddress('0x26a8f4413Cc4E1Fc9E2f330bCa98A9C8549f9553')

with open(compiled_contract_path) as file:
    contract_json = json.load(file)  # load contract info as JSON
    contract_abi = contract_json['abi']  # fetch contract's abi - necessary to call its functions

# Fetch deployed contract reference
purseDistribution = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)

# Call contract function (this is not persisted to the blockchain)
message = purseDistribution.functions.owner().call()
holder = purseDistribution.functions.holder("0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", 1).call()
print(holder)
print(message)

# Get accounts
# web3.eth.defaultAccount = web3.eth.accounts[0]
# web3.eth.defaultAccount = "0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217"
# print(web3.eth.defaultAccount)

nonce = web3.eth.get_transaction_count("0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217") 
print(nonce)
with open("avg_balance_test.csv", 'r', newline='') as csv_balancefile:
    csv_reader = csv.DictReader(csv_balancefile)
    addList = csv_reader.fieldnames
    print(addList[1])
    for row in csv_reader:
        for add in addList:
            if add == "blockNumber":
                continue 
            value = literal_eval(row[add])
            print(value)
            print(add)
            holder = purseDistribution.functions.holder("0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", 1).call()
            print(holder)
            # purseAmount = value / 258491637 * 19237401613
            # tx_hash = purseDistribution.functions.updateHolderInfo(add , int(purseAmount)).transact()
            tx_hash = purseDistribution.functions.updateHolderInfo(add , 10).buildTransaction({'nonce': nonce})
            # print("done")
            signed_tx = web3.eth.account.signTransaction(tx_hash, private_key='54dad62968e13d682a4d01884cbedb95835dbd2d72cee7063d6e9e92558ee8a4')
            web3.eth.sendRawTransaction(signed_tx.rawTransaction)

            # print(tx_hash)            
            print('user done adding')
            # tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            




# print(tx_receipt)
# holderInfo = purseDistribution.functions.holder("0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", 1)
# print(holderInfo)
# print('user done adding')
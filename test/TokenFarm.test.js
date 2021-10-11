const { assert } = require('chai');
const { default: Web3 } = require('web3');

const LpXToken = artifacts.require("LPXToken");
const XToken = artifacts.require("XToken");
const TokenFarm = artifacts.require("TokenFarm");
const PurseToken = artifacts.require("PurseToken")

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor, investor2]) => {
    let lpXToken, xToken, tokenFarm, purseToken

    before(async () => {
        lpXToken = await LpXToken.new()
        xToken = await XToken.new()
        purseToken = await PurseToken.new()
        tokenFarm = await TokenFarm.new(xToken.address, lpXToken.address, purseToken.address, tokens('10'))

        await lpXToken.transfer(tokenFarm.address, tokens('1000000'))
        await xToken.transfer(investor, tokens('100'), { from: owner })
        await xToken.transfer(investor2, tokens('200'), { from: owner })
    })

    describe('X deployment', async () => {
        it('has a name', async () => {
            const name = await xToken.name()
            assert.equal(name, 'PundiX')
        })
    })

    describe('LPX Token deployment', async () => {
        it('has a name', async () => {
            const name = await lpXToken.name()
            assert.equal(name, 'LPX')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'X Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await xToken.balanceOf(tokenFarm.address)
            assert.equal(balance, tokens('0'))
        })

        it('contract has tokens', async () => {
            let balance = await lpXToken.balanceOf(tokenFarm.address)
            assert.equal(balance, tokens('1000000'))
        })
    })

    describe('Farming Token', async () => {
        it('rewards investors for staking mDAI tokens', async () => {
            let result
            // Check investor balance before staking
            result = await xToken.balanceOf(investor)
            assert.equal(result, tokens('100'), 'investor has correct MDAI token before staking')
            result = await xToken.balanceOf(investor2)
            assert.equal(result, tokens('200'), 'investor2 has correct MDAI token before staking')

            // Stake Mock DAI TOkens
            await xToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor })

            // Check staking result
            result = await xToken.balanceOf(investor)
            assert.equal(result, tokens('0'), 'investor has 0 MDAI token after staking')

            result = await xToken.balanceOf(tokenFarm.address)
            assert.equal(result, tokens('100'), 'token Farm has 100 MDAI token after staking')

            const stakerInfo1 = await tokenFarm.stakerInfo(investor)
            assert.equal(stakerInfo1.stakingBalance, tokens('100'), 'investor has 100 MDAI token staking balance after staking')
            assert.equal(stakerInfo1.isStaking.toString(), 'true', 'investor has staking status after staking')

            result = await lpXToken.balanceOf(investor)
            assert.equal(result, tokens('100'), 'investor lpX Token wallet balance correct after staking')



             // Stake Mock DAI TOkens investor2         
            await xToken.approve(tokenFarm.address, tokens('100'), { from: investor2 })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor2 })
             // Check staking result investor2
            const stakerInfo2 = await tokenFarm.stakerInfo(investor2)    
            assert.equal(stakerInfo2.stakingBalance, tokens('100'), 'investor2 has 100 x token staking balance after staking')

            // Issue Tokens
            // await tokenFarm.issueTokens(tokens('50'))
            // result = await xToken.balanceOf(investor)
            // assert.equal(result, tokens('125'), 'investor X Token wallet balance correct after issue tokens')

            // result = await xToken.balanceOf(investor2)
            // assert.equal(result, tokens('125'), 'investor2 X Token wallet balance correct after issue tokens')

            // Ensure that only owner can issue tokens
            // await tokenFarm.issueTokens(tokens('100'), { from: investor }).should.be.rejected;

            //Unstake tokens
            await xToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.unstakeTokens({ from: investor })

            //Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result, tokens('100'), 'investor has correct MDAI token after withdraw')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result, tokens('100'), 'token Farm has 0 MDAI token after withdraw')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result, tokens('0'), 'investor has 0 MDAI token staking balance after withdraw')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor has false staking status after withdraw')

            result = await xToken.balanceOf(investor)
            assert.equal(result, tokens('25'), 'investor X Token wallet balance correct after unstake')

        })
    })
})
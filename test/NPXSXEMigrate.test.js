const { assert } = require('chai');
const { default: Web3 } = require('web3');

const NPXSXEMToken = artifacts.require("NPXSXEMToken");
const NPXSXEMigration = artifacts.require("NPXSXEMigration");
const PurseToken = artifacts.require("PurseToken")

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('NPXSXEMigration', ([owner, migrator, migrator2]) => {
    let npxsxemToken, npxsxeMigration, purseToken

    before(async () => {
        npxsxemToken = await NPXSXEMToken.new()
        purseToken = await PurseToken.new()
        npxsxeMigration = await NPXSXEMigration.new(npxsxemToken.address, purseToken.address)

        await purseToken.transfer(npxsxeMigration.address, tokens('1000000'))
        await npxsxemToken.transfer(migrator, tokens('100'), { from: owner })
        await npxsxemToken.transfer(migrator2, tokens('200'), { from: owner })
    })

    describe('NPXSXEMToken deployment', async () => {
        it('has a name', async () => {
            const name = await npxsxemToken.name()
            assert.equal(name, 'NPXSXEM')
        })
    })

    describe('Purse Token deployment', async () => {
        it('has a name', async () => {
            const name = await purseToken.name()
            assert.equal(name, 'PURSE')
        })
    })

    describe('NPXSXEMigration deployment', async () => {
        it('has a name', async () => {
            const name = await npxsxeMigration.name()
            assert.equal(name, 'NPXSXEM Migration')
        })

        it('contract has tokens', async () => {
            let balance = await npxsxemToken.balanceOf(npxsxeMigration.address)
            assert.equal(balance, tokens('0'))
        })

        it('contract has tokens', async () => {
            let balance = await purseToken.balanceOf(npxsxeMigration.address)
            assert.equal(balance, tokens('500000'))
        })
    })

    describe('Migrate Token', async () => {
        it('rewards migrators for migrate NPXSXEM tokens', async () => {
            let result
            // Check investor balance before staking
            result = await npxsxemToken.balanceOf(migrator)
            assert.equal(result, tokens('100'), 'migrator has correct NPXS token before migrate')
            result = await npxsxemToken.balanceOf(migrator2)
            assert.equal(result, tokens('200'), 'migrator2 has correct NPXS token before migrate')
            result = await purseToken.balanceOf(migrator)
            assert.equal(result, tokens('0'), 'migrator has 0 Purse token before migrate')
            result = await purseToken.balanceOf(migrator2)
            assert.equal(result, tokens('0'), 'migrator2 has 0 Purse token before migrate')

            // Migrate npxsxem Token
            await npxsxemToken.approve(npxsxeMigration.address, tokens('50'), { from: migrator })
            await npxsxeMigration.migrateNPXSXEM(tokens('50'), { from: migrator })

            // Check migrate result
            result = await npxsxemToken.balanceOf(migrator)
            assert.equal(result, tokens('50'), 'migrator has 50 left npxs token after migrate')

            result = await npxsxemToken.balanceOf(npxsxeMigration.address)
            assert.equal(result, tokens('50'), 'npxsxeMigration has 50 npxs token after migrate')

            let balance = await purseToken.balanceOf(npxsxeMigration.address)
            assert.equal(balance, tokens('499994'))

            result = await purseToken.balanceOf(migrator)
            assert.equal(result, tokens('3'), 'migrator has 12% Purse token after migrate')

            const migrateCount = await npxsxeMigration.migrateCount(migrator)
            console.log(migrateCount.toString())
            let migratorInfo = await npxsxeMigration.migrator(migrator, 1, 0)
            assert.equal(migratorInfo.migrateBalance, tokens('50'), 'migrator has 50 NPXS token migrate balance after staking')
            assert.equal(migratorInfo.isRedeem.toString(), 'true', 'migrator has migrate status after migrate')
            migratorInfo = await npxsxeMigration.migrator(migrator, 1, 1)
            assert.equal(migratorInfo.isRedeem.toString(), 'true', 'migrator has migrate status after migrate')
            migratorInfo = await npxsxeMigration.migrator(migrator, 1, 3)
            assert.equal(migratorInfo.isRedeem.toString(), 'true', 'migrator has migrate status after migrate')
            migratorInfo = await npxsxeMigration.migrator(migrator, 1, 7)
            assert.equal(migratorInfo.isRedeem.toString(), 'true', 'migrator has migrate status after migrate')
            migratorInfo = await npxsxeMigration.migrator(migrator, 1, 10)
            assert.equal(migratorInfo.isRedeem.toString(), 'true', 'migrator has migrate status after migrate')

            // Release purse Token
            await npxsxeMigration.release('1','1', { from: migrator })
            result = await purseToken.balanceOf(migrator)
            assert.equal(result, tokens('5'), 'migrator has 8% Purse token more after migrate')
            migratorInfo = await npxsxeMigration.migrator(migrator, 1, 1)
            assert.equal(migratorInfo.isRedeem.toString(), 'false', 'migrator has false migrate status after migrate')


        })
    })
})
const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    describe('can create a star', () => { 
        it('can create a star and get its name', async function () { 
            let tokenId = 1;

            await this.contract.createStar('Awesome Star!', 'alex', 'panas','love','story',tokenId, {from: accounts[0]})
            const result = await this.contract.tokenIdToStarInfo(tokenId);
            assert.equal(result[0], "Awesome Star!");
            assert.equal(result[1],'alex');

        })

        it('returns data in the required format', async function(){
            let tokenId = 1; 
            await this.contract.createStar('Star power 103!', 'mag_245.978', 'ra_032.155','dec_121.874','I love my wonderful star',tokenId, {from: accounts[0]})
            const printOut = await this.contract.tokenIdToStarInfo(tokenId, {from: accounts[0]});
            console.log(printOut);
            // TODO: check required format 
           

        })


        it('checks if star exists', async function(){
            let tokenId1 = 1; 
            let tokenId2 = 2; 

            await this.contract.createStar('Awesome Star!', 'alex', 'panas','love','story',tokenId1, {from: accounts[0]})

            try {
                await this.contract.createStar('Awesome Star!', 'alex', 'panas','love','story',tokenId2, {from: accounts[0]})
                
            } catch (error) {
                assert.isOk(error);
            }
        })


        it('can concatinate strings', async function() {

            const checkIt = await this.contract.append('Awesome Star!','alex','panas',{from:accounts[0]})
            assert.equal(checkIt, 'Awesome Star!alexpanas');
           
        })
    
    })

    describe('buying and selling stars', () => { 

        let user1 = accounts[1]
        let user2 = accounts[2]

        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar('Awesome Star!', 'alex', 'panas','love','story',starId, {from: user1})
            // await this.contract.createStar('awesome star', starId, {from: user1})
        })

        describe('user1 can sell a star', () => { 
            it('user1 can put up their star for sale', async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            
                assert.equal(await this.contract.starsForSale(starId), starPrice)
            })

            it('user1 gets the funds after selling a star', async function () { 
                let starPrice = web3.toWei(.05, 'ether')
                
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})

                let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
                await this.contract.buyStar(starId, {from: user2, value: starPrice})
                let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)

                assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), 
                            balanceOfUser1AfterTransaction.toNumber())
            })
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function () { 
                await this.contract.buyStar(starId, {from: user2, value: starPrice})

                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 correctly has their balance changed', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')

                const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice:0})
                const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)

                assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice)
            })
        })
    })
})
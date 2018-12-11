var HashMarket = artifacts.require("./HashMarket.sol");

contract("HashMarket", function(accounts) {
    it("should add a new product", function() {

        // Set the names of test data
        var itemName = "TestItem";
        var itemPrice = 1000;
        var itemSeller = accounts[0];

        // Since all of our testing functions are async, we store the
        // contract instance at a higher level to enable access from
        // all functions
        var hashMarketContract;

        // Item ID will be provided asynchronously so we extract it
        var itemID;

        return HashMarket.deployed().then(function(instance) {
            // set contract instance into a variable
            hashMarketContract = instance;

            // Subscribe to a Solidity event
            instance.ItemAdded({}).watch((error, result) => {
                if (error) {
                    console.log(error);
                }
                // Once the event is triggered, store the result in the
                // external variable
                itemID = result.args.itemID;
            });

            // Call the addNewItem function and return the promise
            return instance.addNewItem(itemName, itemPrice, {from: itemSeller});
        }).then(function() {
            // This function is triggered after the addNewItem call transaction
            // has been mined. Now call the getItem function with the itemID
            // we received from the event
            return hashMarketContract.getItem.call(itemID);
        }).then(function(result) {
            // The result of getItem is a tuple, we can deconstruct it
            // to variables like this
            var [name, price, seller, status] = result;

            // Start testing. Use web3.toAscii() to convert the result of
            // the smart contract from Solidity bytecode to ASCII. After that
            // use the .replace() to pad the excess bytes from bytes32
            assert.equal(itemName, web3.toAscii(name).replace(/\u0000/g, ''), "Name wasn't properly added");
            // Use assert.equal() to check all the variables
            assert.equal(itemPrice, price, "Price wasn't properly added");
            assert.equal(itemSeller, seller, "Seller wasn't properly added");
            assert.equal(status, 0, "Status wasn't properly added");
        });
    });
});

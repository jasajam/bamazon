// node packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

// establishing connection to db
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "bamazon"
});

// function to start app - calls function to show product name, id, price
connection.connect(function(err) {
    if (err) throw err;

        // for testing connection 
    // console.log("connected as id " + connection.threadId);
    displayProducts();
})

// function to show product name / id / price + calls function to ask if the user wants to shop
function displayProducts() {
    var query = "SELECT item_id, product_name, price FROM products";
    connection.query(query, function(err, res) {
        console.table("Welcome to Bamazon", res);
        isShopping();
    })
}
    // for help while developing, use GUI / put the quantity

// count on how many times user has gone shopping
var shoppingRounds = 0;

// function to determine if the user wants to shop from the available products
    // if the user hasn't shopped before, they're asked if they want to shop
    // if the user has shopped before, they're asked if they want to shop some more
        // if they say yes to either, function is called to let them choose product to buy
        // if they say no to either, connection to db is lost, they are farewelled 
function isShopping() {
    if (shoppingRounds === 0) {
      inquirer
        .prompt({
          name: "shoppingNow",
          type: "confirm",
          message: "Would you like to buy something?",
      }).then(function(answer) {
        if (answer.shoppingNow) {
            console.log("\n" + "Great! Let's shop.");
            shoppingRounds++;
            shopping();
        } else {+
            console.log("\n" + "Ok, we'll be here if you change your mind :)");
            connection.end();
        }
      })
    } else if (shoppingRounds > 0) {
      inquirer
        .prompt({
            name: "shoppingAgain",
            type: "confirm",
            message: "Would you like to keep shopping?",
        }).then(function(answer) {
            if (answer.shoppingAgain) {
                console.log("\n" + "Great! Let's shop.");
                shoppingRounds++;
                shopping();
            } else {
                console.log("\n" + "Ok, we'll be here if you change your mind :)");
                connection.end();
            }
        })   
    } 
};

// function to actually start shopping - choose your product 
function shopping() {

    var shoppingQuestions = [{
        name: "desiredProduct",
        type: "number",
        message: "Enter the id number of the product you'd like to buy."
     },
     {
         name: "desiredQty",
         type: "number",
         message: "How many units of the item would you like to buy?"
     }];

        // from test that my shopping function was getting called
    // console.log("Which item would you like to buy?");
    inquirer
     .prompt(shoppingQuestions).then(function(answer) {
         console.log("\n" + "Thanks, confirming your order now." + "\n");
        //  console.log("desired prod id", answer.desiredProduct);
        confirmOrder(answer.desiredProduct, answer.desiredQty);
     })
}

// determine if there's enough product to meet customer's desires
    // if not, say sorry and invite them to shop more
    // if there is, call function to update table/make sale, show them "a receipt", and invite them to shop more
function confirmOrder(desiredProdID, desiredProdQty) {
    var query = "SELECT product_name, price, stock_quantity FROM products WHERE item_id=" + desiredProdID;
    // console.log("this is productID: ", query);
    
    connection.query(query, function(err, res) {

        if (err) throw err;
        // console.log("available: ", res[0].stock_quantity);
        // console.log("desired: ", desiredProdQty);
        if (res[0].stock_quantity < desiredProdQty) {
            console.log("\n" + 'Sorry, we have insufficient stock for this purchase.' + "\n");
            isShopping();
        } else {
            completeSale(res[0].stock_quantity, desiredProdQty, desiredProdID);
            console.log("\n" + "Thank you for shopping with Bamazon!" + "\n");
            console.table("Order Summary", [{product_name: res[0].product_name, quantity_purchased: desiredProdQty, total_cost: desiredProdQty * res[0].price}]);
            isShopping();
        } 
    });
}

// function for selling the item to the customer called above - 
    // updates database to reflect new stock quantity per customer's purchase
function completeSale(stock, desiredProdQty, desiredProdID) {
    var remainingProd = stock - desiredProdQty;
    var sqlUpdate = "UPDATE products SET stock_quantity=" + remainingProd + " WHERE item_id=" + desiredProdID;
    // console.log(sqlUpdate);

    connection.query(sqlUpdate, function(err, res) {
        if (err) throw err;

        // console.log(res.affectedRows + "record updated!");
    })
}


// XX run node bamazonCustomer.js
    // --> you see ids, names, and prices of all available products
    // SELECT above from products



//XX  via inquirer you get asked what id you want to buy
// XX ask how many units you want to buy 
// check if stock >= # units customer wants
    // XX if no, message: "Sorry, we have insufficent stock for this purchase"
        // prevent order 
        // and ask again? (or ask, want to buy something less or buy something else? )
    // XX if enough
        // fulfill order - subtract customer desired qty from stock
            // update database
        // message to customer:
            // Thank you for shopping with Bamazon!
            // Summary of Order: 
                // Product Name   Qty  Total Cost--multiplication
        // ask customer if would like to continue shopping
            // if yes, 
                // message great
                // start at top
            // if no, "Ok, have a nice day :)" 
                // end connection
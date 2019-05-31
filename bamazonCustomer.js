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
            console.log("Great! Let's shop.");
            shoppingRounds++;
            shopping();
        } else {
            console.log("Ok, we'll be here if you change your mind");
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
                console.log("Great! Let's shop.");
                shoppingRounds++;
                shopping();
            } else {
                console.log("Ok, we'll be here if you change your mind");
                connection.end();
            }
        })   
    } 
};

// function to actually start shopping - choose your product 
function shopping() {
    console.log("Which item would you like to buy?");
}

// run node bamazonCustomer.js
    // --> you see ids, names, and prices of all available products
    // SELECT above from products



// via inquirer you get asked what id you want to buy
// ask how many units you want to buy 
// check if stock >= # units customer wants
    // if no, message: "Sorry, we have insufficent stock for this purchase"
        // prevent order 
        // and ask again? (or ask, want to buy something less or buy something else? )
    // if enough
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
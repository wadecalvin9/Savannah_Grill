const dummyData = {
    categories: [
        { name: "Burgers & Sandwiches", description: "Flame-grilled beef, crispy chicken, and club sandwiches" },
        { name: "Pizzas", description: "Oven-baked loaded pizzas and cheesy crusts" },
        { name: "Chicken & Combos", description: "Crispy fried chicken, peri-peri flame meals, and buckets" },
        { name: "Wraps & Burritos", description: "Rolled chicken wraps, shawarmas, and burritos" },
        { name: "Bowls & Loaded Mains", description: "Teriyaki rice bowls, loaded fries, and pasta" },
        { name: "Sides & Bites", description: "Crispy wings, loaded fries, and quick bites" },
    ],

    customizations: [
        // Toppings & Sauces
        { name: "Extra Cheese Slice", price: 100, type: "topping" },
        { name: "Periperi Sauce Dip", price: 80, type: "topping" },
        { name: "Barbeque Dip", price: 80, type: "topping" },
        { name: "Jalapeños", price: 70, type: "topping" },
        { name: "Garlic Mayo Dip", price: 90, type: "topping" },
        { name: "Crispy Bacon", price: 150, type: "topping" },

        // Drinks & Sides
        { name: "Regular Fries", price: 200, type: "size" },
        { name: "Masala Chips", price: 300, type: "size" },
        { name: "Peri Peri Fries", price: 250, type: "size" },
        { name: "Coleslaw (Small)", price: 120, type: "size" },
        { name: "Garlic Bread (3 pcs)", price: 250, type: "size" },
        { name: "500ml Soda (Coke/Fanta/Sprite)", price: 120, type: "size" },
        { name: "Stoney Tangawizi 500ml", price: 120, type: "size" },
        { name: "Minute Maid Juice 400ml", price: 150, type: "size" },
        { name: "Chocolate Milkshake", price: 400, type: "size" },
        { name: "Chocolate Brownie", price: 350, type: "size" },
    ],

    menu: [
        {
            name: "Classic Cheese Beef Burger",
            description: "100% beef patty, cheddar cheese, pickles, and signature burger sauce",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/044/844/600/large_2x/homemade-fresh-tasty-burger-with-meat-and-cheese-classic-cheese-burger-and-vegetable-ai-generated-free-png.png",
            price: 650.0,
            rating: 4.6,
            calories: 620,
            protein: 28,
            category_name: "Burgers & Sandwiches",
            customizations: ["Extra Cheese Slice", "Regular Fries", "500ml Soda (Coke/Fanta/Sprite)", "Crispy Bacon"],
        },
        {
            name: "BBQ Crispy Chicken Burger",
            description: "Deep-fried chicken breast, smoky BBQ sauce, shredded lettuce, and mayo",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/051/814/008/large_2x/a-grilled-chicken-sandwich-with-lettuce-and-tomatoes-free-png.png",
            price: 720.0,
            rating: 4.7,
            calories: 670,
            protein: 31,
            category_name: "Burgers & Sandwiches",
            customizations: ["Masala Chips", "Barbeque Dip", "Stoney Tangawizi 500ml", "Extra Cheese Slice"],
        },
        {
            name: "Chicken Tikka Pizza (Medium)",
            description: "Spicy chicken tikka chunks, sweet corn, green peppers, mozzarella, and tomato base",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/023/742/417/large_2x/pepperoni-pizza-isolated-illustration-ai-generative-free-png.png",
            price: 1100.0,
            rating: 4.8,
            calories: 850,
            protein: 36,
            category_name: "Pizzas",
            customizations: ["Garlic Bread (3 pcs)", "500ml Soda (Coke/Fanta/Sprite)", "Jalapeños", "Garlic Mayo Dip"],
        },
        {
            name: "Double Pepperoni Feast Pizza",
            description: "Loaded double pepperoni slices with extra melted mozzarella cheese",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/058/700/845/large_2x/free-isolated-on-transparent-background-delicious-pizza-topped-with-fresh-tomatoes-basil-and-melted-cheese-perfect-for-food-free-png.png",
            price: 1250.0,
            rating: 4.5,
            calories: 920,
            protein: 38,
            category_name: "Pizzas",
            customizations: ["Extra Cheese Slice", "Periperi Sauce Dip", "Minute Maid Juice 400ml"],
        },
        {
            name: "2-Piece Fried Chicken Meal",
            description: "2 pieces of crispy fried chicken served with regular chips and a dip",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/060/236/245/large_2x/a-large-hamburger-with-cheese-onions-and-lettuce-free-png.png",
            price: 580.0,
            rating: 4.7,
            calories: 710,
            protein: 40,
            category_name: "Chicken & Combos",
            customizations: ["Coleslaw (Small)", "Peri Peri Fries", "500ml Soda (Coke/Fanta/Sprite)"],
        },
        {
            name: "Flame-Grilled 1/4 Peri-Peri Chicken Meal",
            description: "Quarter chicken marinated in peri-peri spices, flame-grilled to order",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/048/930/603/large_2x/caesar-wrap-grilled-chicken-isolated-on-transparent-background-free-png.png",
            price: 790.0,
            rating: 4.9,
            calories: 640,
            protein: 45,
            category_name: "Chicken & Combos",
            customizations: ["Periperi Sauce Dip", "Masala Chips", "Stoney Tangawizi 500ml"],
        },
        {
            name: "Crispy Chicken Sweet Chili Wrap",
            description: "Sliced chicken tenders, sweet chili mayo, fresh lettuce, and tomato wrapped in a tortilla",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/057/913/530/large_2x/delicious-wraps-a-tantalizing-array-of-wraps-filled-with-vibrant-vegetables-succulent-fillings-and-fresh-ingredients-artfully-arranged-for-a-mouthwatering-culinary-experience-free-png.png",
            price: 680.0,
            rating: 4.4,
            calories: 520,
            protein: 26,
            category_name: "Wraps & Burritos",
            customizations: ["Regular Fries", "Minute Maid Juice 400ml", "Garlic Mayo Dip"],
        },
        {
            name: "Loaded Teriyaki Chicken Rice Bowl",
            description: "Savory grilled chicken strips over fragrant basmati rice, sautéed veggies, and teriyaki glaze",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/057/466/374/large_2x/healthy-quinoa-bowl-with-avocado-tomato-and-black-beans-ingredients-free-png.png",
            price: 850.0,
            rating: 4.6,
            calories: 610,
            protein: 34,
            category_name: "Bowls & Loaded Mains",
            customizations: ["Jalapeños", "Chocolate Milkshake", "Extra Cheese Slice"],
        },
        {
            name: "Spicy Buffalo Wings (6 pcs)",
            description: "6 crispy chicken wings tossed in hot buffalo sauce, served with ranch",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/056/106/379/large_2x/top-view-salad-with-chicken-avocado-tomatoes-and-lettuce-free-png.png",
            price: 550.0,
            rating: 4.8,
            calories: 480,
            protein: 30,
            category_name: "Sides & Bites",
            customizations: ["Garlic Mayo Dip", "500ml Soda (Coke/Fanta/Sprite)", "Peri Peri Fries"],
        },
        {
            name: "Triple Deck Chicken Club Sandwich",
            description: "Toasted bread stacked with grilled chicken, turkey bacon, egg, lettuce, and mayo",
            image_url:
                "https://static.vecteezy.com/system/resources/previews/060/364/135/large_2x/a-flavorful-club-sandwich-with-turkey-bacon-and-fresh-vegetables-sliced-and-isolated-on-a-transparent-background-free-png.png",
            price: 780.0,
            rating: 4.5,
            calories: 690,
            protein: 32,
            category_name: "Burgers & Sandwiches",
            customizations: ["Regular Fries", "Chocolate Brownie", "Minute Maid Juice 400ml"],
        },
    ],
};

export default dummyData;
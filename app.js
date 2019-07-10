const cartBtn = document.querySelector(".cart-btn");
const closeCaartBtn = document.querySelector(".close-cart");
const clearCaartBtn = document.querySelector(".clear-cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const prodductsDOM = document.querySelector(".products-center");

//const btns = document.querySelectorAll(".bag-btn");
//console.log("btns", btns);

//cart
let cart = [];
let bagButtons = [];

//get the products
class Products {
  async getProducts() {
    try {
      let results = await fetch("products.json");
      let data = await results.json();
      let products = data.items;

      products = products.map((item, index) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { id, title, price, image };
      });
      Storage.saveProducts(products);
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//display products
class UI {
  displayProducts(products) {
    //console.log("UI => displayProducts() => ", products);

    let results = "";

    products.forEach(product => {
      results += `
    <!-- single prodcucts-->
    <article class="product">
      <div class="img-container">
        <img
          src=${product.image}
          alt="prod"
          class="product-img"
        />
        <button class="bag-btn" data-id=${product.id}>
          <i class="fas fa-shopping-cart"></i>add to bag
        </button>
      </div>
      <h3>${product.title}</h3>
      <h4>$${product.price}</h4>
    </article>
    <!-- end single prodcucts-->
    `;
    });

    prodductsDOM.innerHTML = results;
  }

  setCartValues(cart) {
    let tempCartTotal = 0;
    let itemsQtyTotal = 0;

    cart.map(item => {
      tempCartTotal += item.price * item.qty;
      itemsQtyTotal += item.qty;
    });
    cartTotal.innerText = parseFloat(tempCartTotal).toFixed(2);
    cartItems.innerText = itemsQtyTotal;
    //console.log("UI => setCartValues() => ", cartTotal, cartItems);
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${item.image} alt="product" />
    <div class="">
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.qty}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `;
    cartContent.appendChild(div);
    console.log("UI => addCartItem() => ", div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  getBagButtons() {
    bagButtons = [...document.querySelectorAll(".bag-btn")];
    //console.log("UI => getBagButtons =>", bagButtons);

    bagButtons.forEach(btn => {
      let id = btn.dataset.id;
      //console.log("UI => getBagButtons() => bagButtons.forEach", id);
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        btn.innerText = "In Bag";
        btn.disabled = true;
      } else {
        btn.addEventListener("click", event => {
          //   console.log(
          //     "UI => getBagButtons() => bagButtons.forEach => click event",
          //     event
          //   );

          event.target.innerText = "In Cart";
          event.target.disabled = true;

          // get product from products
          let cartItem = { ...Storage.getProduct(id), qty: 1 };
          // console.log(
          //   "UI => getBagButtons() => bagButtons.forEach => click event",
          //   cartItem
          // );

          // add product to the cart
          cart = [...cart, cartItem];
          // console.log(
          //   "UI => getBagButtons() => bagButtons.forEach => click event",
          //   cart
          // );

          // save cart in local storeage
          Storage.saveCart(cart);

          // set cart value
          this.setCartValues(cart);

          // display cart item
          this.addCartItem(cartItem);

          // show the cart
          this.showCart();
        });
      }
    });
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.papulateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCaartBtn.addEventListener("click", this.hideCart);
  }

  papulateCart(cart) {
    cart.forEach(item => {
      this.addCartItem(item);
    });
  }

  cartLogic() {
    //clear cart button
    clearCaartBtn.addEventListener("click", () => this.clearCart());

    cartContent.addEventListener("click", event => {
      console.log(event.target);
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let Arrow = event.target;
        let id = Arrow.dataset.id;
        let tmpItem = cart.find(item => item.id === id);
        tmpItem.qty = tmpItem.qty + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        Arrow.nextElementSibling.innerText = tmpItem.qty;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let Arrow = event.target;
        let id = Arrow.dataset.id;
        let tmpItem = cart.find(item => item.id === id);
        if (tmpItem.qty > 0) {
          tmpItem.qty = tmpItem.qty - 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          Arrow.previousElementSibling.innerText = tmpItem.qty;
        } else {
          this.removeItem(id);
          cartContent.removeChild(Arrow.parentElement.parentElement);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
  }

  getSingleButton(id) {
    return bagButtons.find(button => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    if (localStorage.getItem("cart"))
      return JSON.parse(localStorage.getItem("cart"));
    return [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  //setup app
  ui.setupApp();

  //get all products
  products
    .getProducts()
    .then(Products => ui.displayProducts(Products))
    .then(() => {
      ui.cartLogic();
      ui.getBagButtons();
    });
});

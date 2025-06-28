import { pizzaId } from "../consts/shared";

const getPizzaCount = (orderItems) => {
    let pizzaCount = 0;
    orderItems.forEach(item => {
        if(item.item_id === pizzaId){
          pizzaCount = pizzaCount + item.qty;
        }
    });
    return pizzaCount;
  };

export default getPizzaCount;
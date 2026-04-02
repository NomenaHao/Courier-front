import api from './api'; 

export const orderService = {
  getDeliverers() {
    return api.get('/auth/users/?role=deliverer'); 
  },

  createOrder(orderData) {
    return api.post('/orders/create/', orderData);
  }
};
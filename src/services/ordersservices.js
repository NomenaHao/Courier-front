import api from "./api";

export const orderService = {
  createOrder(orderData) {
    return api.post("orders/create/", orderData);
  },

  getMyOrders() {
    return api.get("orders/my-orders/");
  },

  getMyDeliveries() {
    return api.get("orders/my-deliveries/");
  },

  getAdminOrders(params = {}) {
    return api.get("orders/admin/", { params });
  },

  assignDeliverer(orderId, delivererId) {
    return api.post(`orders/${orderId}/assign/`, { deliverer_id: delivererId });
  },

  updateAssignmentStatus(orderId, action) {
    return api.post(`orders/${orderId}/assignment/${action}/`);
  },
};

export const authService = {
  getDeliverers() {
    return api.get("auth/livreurs/");
  },

  getProfile() {
    return api.get("auth/profile/");
  },

  updateProfile(data) {
    return api.patch("auth/profile/", data);
  },
};

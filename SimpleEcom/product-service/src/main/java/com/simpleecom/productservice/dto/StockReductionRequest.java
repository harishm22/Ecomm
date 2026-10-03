package com.simpleecom.productservice.dto;

public class StockReductionRequest {
    private Long productId;
    private int quantity;

    public StockReductionRequest() {}

    public StockReductionRequest(Long productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}

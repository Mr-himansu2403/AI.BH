package com.aibh.model;

public class Intent {
    private String type;
    private double confidence;
    private String category;
    
    public Intent() {}
    
    public Intent(String type, double confidence, String category) {
        this.type = type;
        this.confidence = confidence;
        this.category = category;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
}
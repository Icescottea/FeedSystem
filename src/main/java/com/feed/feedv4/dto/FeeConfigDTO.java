package com.feed.feedv4.dto;

public class FeeConfigDTO {
    private double formulationFeePerKg;
    private double pelletingFeeFixed;
    private double pelletingFeePercent;
    private double rawMaterialMarkupPercent;
    private double taxRate;
    private double defaultDiscount;

    public FeeConfigDTO() {}

    public double getFormulationFeePerKg() {
        return formulationFeePerKg;
    }

    public void setFormulationFeePerKg(double formulationFeePerKg) {
        this.formulationFeePerKg = formulationFeePerKg;
    }

    public double getPelletingFeeFixed() {
        return pelletingFeeFixed;
    }

    public void setPelletingFeeFixed(double pelletingFeeFixed) {
        this.pelletingFeeFixed = pelletingFeeFixed;
    }

    public double getPelletingFeePercent() {
        return pelletingFeePercent;
    }

    public void setPelletingFeePercent(double pelletingFeePercent) {
        this.pelletingFeePercent = pelletingFeePercent;
    }

    public double getRawMaterialMarkupPercent() {
        return rawMaterialMarkupPercent;
    }

    public void setRawMaterialMarkupPercent(double rawMaterialMarkupPercent) {
        this.rawMaterialMarkupPercent = rawMaterialMarkupPercent;
    }

    public double getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(double taxRate) {
        this.taxRate = taxRate;
    }

    public double getDefaultDiscount() {
        return defaultDiscount;
    }

    public void setDefaultDiscount(double defaultDiscount) {
        this.defaultDiscount = defaultDiscount;
    }
}

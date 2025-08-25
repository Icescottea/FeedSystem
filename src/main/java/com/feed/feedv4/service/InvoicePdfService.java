package com.feed.feedv4.service;

import com.feed.feedv4.model.*;
import com.feed.feedv4.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepo;
    private final PelletingBatchRepository batchRepo;
    private final FactoryRepository factoryRepo;
    private final ChargesConfigRepository chargesRepo;

    public InvoicePdfService(InvoiceRepository invoiceRepo,
                             PelletingBatchRepository batchRepo,
                             FactoryRepository factoryRepo,
                             ChargesConfigRepository chargesRepo) {
        this.invoiceRepo = invoiceRepo;
        this.batchRepo = batchRepo;
        this.factoryRepo = factoryRepo;
        this.chargesRepo = chargesRepo;
    }

    public byte[] exportInvoicePdf(Long id) {
        Invoice inv = invoiceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // ---------- Resolve batch + formulation cost ----------
        PelletingBatch batch = null;
        if (inv.getBatchId() != null) {
            // use fetch-join variant if available (you showed this exists)
            batch = batchRepo.findWithFormulationById(inv.getBatchId()).orElse(null);
            if (batch == null) {
                batch = batchRepo.findById(inv.getBatchId()).orElse(null);
            }
        }

        double qtyKg = 0.0;
        double formulationCostPerKg = 0.0;
        if (batch != null) {
            qtyKg = (batch.getActualYieldKg() > 0 ? batch.getActualYieldKg()
                    : (batch.getTargetQuantityKg() > 0 ? batch.getTargetQuantityKg() : 0));
            if (batch.getFormulation() != null) {
                Double cpk = batch.getFormulation().getCostPerKg();
                formulationCostPerKg = (cpk != null ? cpk : 0.0);
            }
        }

        // Base manufacturing cost
        double base = round2(qtyKg * formulationCostPerKg);

        // ---------- Resolve fees from ChargesConfig ----------
        ChargesConfig cfg = resolveChargesConfig(inv.getServiceType());
        String feeNameForDisplay = (cfg != null ? cfg.getName() : (inv.getServiceType() != null ? inv.getServiceType() : "Service"));

        double pelletingFeeTotal = 0.0;
        double formulationFeeTotal = 0.0;
        double systemFeeTotal = 0.0;

        double pelletingPerKg = 0.0, pelletingPerBatch = 0.0;
        double formulationPerKg = 0.0, formulationPerBatch = 0.0;
        Double systemPercent = 0.0;

        if (cfg != null) {
            if (cfg.getPelletingFeeType() == ChargesConfig.FeeBasis.PER_KG) {
                pelletingPerKg = safe(cfg.getPelletingFee());
            } else {
                pelletingPerBatch = safe(cfg.getPelletingFee());
            }
            if (cfg.getFormulationFeeType() == ChargesConfig.FeeBasis.PER_KG) {
                formulationPerKg = safe(cfg.getFormulationFee());
            } else {
                formulationPerBatch = safe(cfg.getFormulationFee());
            }
            systemPercent = safe(cfg.getSystemFeePercent());

            pelletingFeeTotal   = round2(qtyKg * pelletingPerKg) + pelletingPerBatch;
            formulationFeeTotal = round2(qtyKg * formulationPerKg) + formulationPerBatch;
            systemFeeTotal      = round2(base * (systemPercent / 100.0));
        }

        // Pre-tax subtotal (manufacturing + fees)
        double subtotal = round2(base + pelletingFeeTotal + formulationFeeTotal + systemFeeTotal);

        // Discount & Tax from Invoice
        double discount = safe(inv.getDiscount());
        double taxRate  = safe(inv.getTaxRate());
        double taxAmt   = round2(subtotal * (taxRate / 100.0));

        // Grand total (already saved as inv.amount, but recompute for display)
        double grandTotal = round2(subtotal - discount + taxAmt);

        // ---------- Resolve Factory (by formulation.factory name) ----------
        Factory factory = null;
        if (batch != null && batch.getFormulation() != null) {
            String fname = batch.getFormulation().getFactory();
            if (fname != null && !fname.isBlank()) {
                factory = factoryRepo.findByNameContainingIgnoreCase(fname)
                        .stream().findFirst().orElse(null);
            }
        }

        DecimalFormat moneyFmt = new DecimalFormat("#,##0.00");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ===== (1) FACTORY HEADER =====
            PdfPTable header = new PdfPTable(1);
            header.setWidthPercentage(100);
            if (factory != null && factory.getLogoUrl() != null && !factory.getLogoUrl().isBlank()) {
                try {
                    Image logo = Image.getInstance(new URL(factory.getLogoUrl()));
                    logo.scaleToFit(120, 120);
                    PdfPCell logoCell = new PdfPCell(logo, false);
                    logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    logoCell.setBorder(Rectangle.NO_BORDER);
                    logoCell.setPaddingBottom(8f);
                    header.addCell(logoCell);
                } catch (Exception ignored) {
                    addFactoryNameCell(header, (factory.getName() != null ? factory.getName() : "INVOICE"));
                }
            } else {
                addFactoryNameCell(header, (factory != null && factory.getName() != null) ? factory.getName() : "INVOICE");
            }
            doc.add(header);
            doc.add(Chunk.NEWLINE);

            // ===== (2) BASIC INFO BLOCK =====
            PdfPTable info = new PdfPTable(new float[]{48f, 52f});
            info.setWidthPercentage(100);

            PdfPTable left = new PdfPTable(new float[]{40f, 60f});
            left.setWidthPercentage(100);
            addInfoRow(left, "Invoice Number:", String.valueOf(inv.getId()));
            if (inv.getBatchId() != null) addInfoRow(left, "Batch ID:", String.valueOf(inv.getBatchId()));
            String issued = (inv.getDateIssued() != null ? inv.getDateIssued().toLocalDate().toString() : LocalDateTime.now().toLocalDate().toString());
            addInfoRow(left, "Date:", issued);

            PdfPCell leftCell = new PdfPCell(left);
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.setPadding(4f);
            info.addCell(leftCell);

            PdfPTable right = new PdfPTable(1);
            right.setWidthPercentage(100);
            PdfPCell billedHdr = new PdfPCell(new Phrase("BILLED TO:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            billedHdr.setBorder(Rectangle.NO_BORDER);
            billedHdr.setPaddingBottom(4f);
            right.addCell(billedHdr);
            PdfPCell billedName = new PdfPCell(new Phrase(
                    inv.getCustomerName() != null ? inv.getCustomerName() : "-",
                    FontFactory.getFont(FontFactory.HELVETICA, 10)));
            billedName.setBorder(Rectangle.NO_BORDER);
            right.addCell(billedName);

            PdfPCell rightCell = new PdfPCell(right);
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setPadding(4f);
            info.addCell(rightCell);

            doc.add(info);
            doc.add(Chunk.NEWLINE);

            // ===== (3) LINE ITEMS TABLE =====
            PdfPTable items = new PdfPTable(new float[]{8f, 46f, 14f, 16f, 16f});
            items.setWidthPercentage(100);

            addHeaderCell(items, "#");
            addHeaderCell(items, "DESCRIPTION");
            addHeaderCell(items, "QTY");
            addHeaderCell(items, "UNIT PRICE (Rs.)");
            addHeaderCell(items, "TOTAL (Rs.)");

            int row = 1;

            // Base manufacturing cost
            addRow(items, String.valueOf(row++),
                    "Manufacturing Cost (Formulation)",
                    qtyStr(qtyKg), moneyFmt.format(formulationCostPerKg), moneyFmt.format(base));

            // Pelleting fee
            if (pelletingPerKg > 0) {
                addRow(items, String.valueOf(row++),
                        "Pelleting Fee (per kg)",
                        qtyStr(qtyKg), moneyFmt.format(pelletingPerKg), moneyFmt.format(round2(qtyKg * pelletingPerKg)));
            }
            if (pelletingPerBatch > 0) {
                addRow(items, String.valueOf(row++),
                        "Pelleting Fee (per batch)",
                        "1", moneyFmt.format(pelletingPerBatch), moneyFmt.format(pelletingPerBatch));
            }

            // Formulation fee
            if (formulationPerKg > 0) {
                addRow(items, String.valueOf(row++),
                        "Formulation Fee (per kg)",
                        qtyStr(qtyKg), moneyFmt.format(formulationPerKg), moneyFmt.format(round2(qtyKg * formulationPerKg)));
            }
            if (formulationPerBatch > 0) {
                addRow(items, String.valueOf(row++),
                        "Formulation Fee (per batch)",
                        "1", moneyFmt.format(formulationPerBatch), moneyFmt.format(formulationPerBatch));
            }

            // System fee
            if (systemPercent > 0) {
                addRow(items, String.valueOf(row++),
                        "System Fee (" + moneyFmt.format(systemPercent) + "% of base)",
                        "-", "-", moneyFmt.format(systemFeeTotal));
            }

            doc.add(items);
            doc.add(Chunk.NEWLINE);

            // ===== (4) TOTALS SUMMARY =====
            PdfPTable totals = new PdfPTable(new float[]{60f, 40f});
            totals.setWidthPercentage(42);
            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);

            addTotalRow(totals, "Subtotal:", moneyFmt.format(subtotal), false);
            if (discount > 0) addTotalRow(totals, "Discount:", "− " + moneyFmt.format(discount), false);
            if (taxRate > 0) addTotalRow(totals, "Tax (" + moneyFmt.format(taxRate) + "%):", moneyFmt.format(taxAmt), false);
            addTotalRow(totals, "GRAND TOTAL:", moneyFmt.format(grandTotal), true);

            doc.add(totals);
            doc.add(Chunk.NEWLINE);

            // ===== (5) TERMS (table only for this section) =====
            PdfPTable termsTable = new PdfPTable(1);
            termsTable.setWidthPercentage(100);
            PdfPCell th = new PdfPCell(new Phrase("TERMS AND CONDITIONS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            th.setBorder(Rectangle.NO_BORDER);
            th.setPaddingBottom(5f);
            termsTable.addCell(th);

            com.lowagie.text.List termsList = new com.lowagie.text.List(false, 10);
            termsList.add(new ListItem("Payment is due within 30 days of invoice date."));
            termsList.add(new ListItem("A 1.5% monthly service charge is applicable on overdue accounts."));
            termsList.add(new ListItem("Goods remain the property of the seller until paid in full."));
            termsList.add(new ListItem("Returned goods will not be accepted without prior authorization."));

            PdfPCell tc = new PdfPCell();
            tc.addElement(termsList);
            tc.setBorder(Rectangle.NO_BORDER);
            tc.setPadding(4f);
            termsTable.addCell(tc);
            doc.add(termsTable);
            doc.add(Chunk.NEWLINE);

            // ===== (6) FOOTER =====
            Paragraph footer = new Paragraph("Thank you for your business!",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9));
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            if (factory != null && factory.getContactNumber() != null) {
                Paragraph contact = new Paragraph("Contact: " + factory.getContactNumber(),
                        FontFactory.getFont(FontFactory.HELVETICA, 8));
                contact.setAlignment(Element.ALIGN_CENTER);
                doc.add(contact);
            }

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Invoice PDF export failed", e);
        }
    }

    /* ================= helpers ================= */

    private ChargesConfig resolveChargesConfig(String key) {
        if (key == null || key.isBlank()) return null;
        // try by NAME first (your UI stores config name in Invoice.serviceType)
        Optional<ChargesConfig> byName = chargesRepo.findByNameIgnoreCase(key);
        if (byName.isPresent()) return byName.get();

        // if not found and looks numeric, try by ID
        try {
            Long id = Long.valueOf(key);
            return chargesRepo.findById(id).orElse(null);
        } catch (NumberFormatException ignored) { }
        // fallback to latest active
        return chargesRepo.findTopByActiveTrueAndArchivedFalseOrderByUpdatedAtDesc()
                .orElseGet(() -> chargesRepo.findTopByActiveTrueAndArchivedFalseOrderByCreatedAtDesc().orElse(null));
    }

    private static double safe(Double v) { return v == null ? 0.0 : v; }
    private static double round2(double v) { return Math.round((v + 1e-9) * 100.0) / 100.0; }
    private static String qtyStr(double q) { return (q == (long) q) ? String.valueOf((long) q) : String.valueOf(q); }

    private static void addFactoryNameCell(PdfPTable table, String name) {
        PdfPCell c = new PdfPCell(new Phrase(name, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBorder(Rectangle.NO_BORDER);
        c.setPaddingBottom(8f);
        table.addCell(c);
    }

    private static void addInfoRow(PdfPTable t, String label, String value) {
        Font b = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font n = FontFactory.getFont(FontFactory.HELVETICA, 10);

        PdfPCell l = new PdfPCell(new Phrase(label, b));
        l.setBorder(Rectangle.NO_BORDER);
        l.setPadding(3f);
        t.addCell(l);

        PdfPCell v = new PdfPCell(new Phrase(value != null ? value : "-", n));
        v.setBorder(Rectangle.NO_BORDER);
        v.setPadding(3f);
        t.addCell(v);
    }

    private static void addHeaderCell(PdfPTable t, String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setBackgroundColor(new java.awt.Color(240, 240, 240));
        c.setPadding(5f);
        t.addCell(c);
    }

    private static void addRow(PdfPTable t, String idx, String desc, String qty, String unit, String total) {
        t.addCell(cell(idx, Element.ALIGN_CENTER));
        t.addCell(cell(desc, Element.ALIGN_LEFT));
        t.addCell(cell(qty, Element.ALIGN_CENTER));
        t.addCell(cell(unit, Element.ALIGN_RIGHT));
        t.addCell(cell(total, Element.ALIGN_RIGHT));
    }

    private static PdfPCell cell(String text, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text != null ? text : "-", FontFactory.getFont(FontFactory.HELVETICA, 10)));
        c.setHorizontalAlignment(align);
        c.setPadding(5f);
        return c;
    }

    private static void addTotalRow(PdfPTable t, String label, String value, boolean strong) {
        Font f = FontFactory.getFont(strong ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA, 10);
        PdfPCell l = new PdfPCell(new Phrase(label, f));
        l.setHorizontalAlignment(Element.ALIGN_RIGHT);
        l.setBorder(Rectangle.NO_BORDER);
        l.setPadding(3f);
        t.addCell(l);

        PdfPCell v = new PdfPCell(new Phrase(value, f));
        v.setHorizontalAlignment(Element.ALIGN_RIGHT);
        v.setBorder(Rectangle.NO_BORDER);
        v.setPadding(3f);
        t.addCell(v);
    }
}
